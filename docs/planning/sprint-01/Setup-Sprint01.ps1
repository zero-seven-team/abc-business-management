#requires -Version 5.1
[CmdletBinding()]
param([switch]$Apply)

# Default: read-only preview. Use -Apply only after checking the preview.
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8
$OutputEncoding = $utf8
$repo = 'zero-seven-team/abc-business-management'
$parentNumber = 1

function Invoke-GitHub {
    param([string]$Endpoint, [string]$Method = 'GET', $Payload = $null)
    $cliArgs = @('api', '--hostname', 'github.com', '--method', $Method,
        '-H', 'Accept: application/vnd.github+json',
        '-H', 'X-GitHub-Api-Version: 2022-11-28', $Endpoint)
    $tempFile = $null
    try {
        if ($null -ne $Payload) {
            $tempFile = [IO.Path]::GetTempFileName()
            [IO.File]::WriteAllText($tempFile, ($Payload | ConvertTo-Json -Depth 20), $utf8)
            $cliArgs += @('--input', $tempFile)
        }
        $output = & gh @cliArgs
        if ($LASTEXITCODE -ne 0) {
            throw "GitHub API failed: $Method $Endpoint. Fix the reported error, then rerun; do not create duplicate tasks manually."
        }
        $text = $output -join "`n"
        if (-not [string]::IsNullOrWhiteSpace($text)) { return ($text | ConvertFrom-Json) }
    }
    finally {
        if ($tempFile -and (Test-Path -LiteralPath $tempFile)) {
            Remove-Item -LiteralPath $tempFile -Force
        }
    }
}

function Get-Pages {
    param([string]$Endpoint)
    $separator = '?'
    if ($Endpoint.Contains('?')) { $separator = '&' }
    for ($page = 1; ; $page++) {
        $items = @(Invoke-GitHub -Endpoint ("${Endpoint}${separator}per_page=100&page=$page"))
        foreach ($item in $items) { Write-Output $item }
        if ($items.Count -lt 100) { break }
    }
}

function Assert-Assignment {
    param($Issue, [string]$Login, [int]$MilestoneNumber, [switch]$AllowMissing)
    $assigned = @($Issue.assignees | ForEach-Object { $_.login })
    if ($assigned.Count -gt 0 -and ($assigned.Count -ne 1 -or $assigned[0] -ine $Login)) {
        throw "Issue #$($Issue.number): unexpected assignee(s): $($assigned -join ', '). Expected: $Login. Check manually before rerunning."
    }
    if ($null -ne $Issue.milestone -and $Issue.milestone.number -ne $MilestoneNumber) {
        throw "Issue #$($Issue.number) belongs to another milestone. Check manually before rerunning."
    }
    if (-not $AllowMissing -and ($assigned.Count -ne 1 -or $null -eq $Issue.milestone)) {
        throw "Issue #$($Issue.number): GitHub did not save the requested assignee/milestone. Check your permissions."
    }
}

try {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw 'Install GitHub CLI first: winget install --id GitHub.cli --exact. Reopen PowerShell, then run gh auth login.'
    }
    $manifestPath = Join-Path $PSScriptRoot 'issues-manifest.json'
    $plan = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($plan.repository -ne $repo -or @($plan.tasks).Count -ne 19 -or
        ($plan.tasks | Measure-Object estimate_hours -Sum).Sum -ne 99) {
        throw 'Invalid plan: expected the agreed repository, 19 tasks and 99 hours.'
    }
    $me = Invoke-GitHub -Endpoint 'user'
    $repository = Invoke-GitHub -Endpoint "repos/$repo"
    Write-Host "Signed in: $($me.login) | Repository: $repo"
    if (-not $repository.permissions.push) { throw 'The signed-in account needs Write access to this repository.' }
    $parent = Invoke-GitHub -Endpoint "repos/$repo/issues/$parentNumber"
    if ($parent.pull_request -or $parent.title -notmatch '^\[PB-01\]' -or $parent.state -ne 'open') {
        throw 'Issue #1 must be the open PB-01 parent issue. No changes made.'
    }
    $milestones = @(Get-Pages -Endpoint "repos/$repo/milestones?state=all" |
        Where-Object { $_.title -eq $plan.milestone })
    if ($milestones.Count -ne 1 -or $milestones[0].state -ne 'open') {
        throw 'Expected exactly one open milestone named Sprint 01. Check GitHub first.'
    }
    $milestone = $milestones[0]
    if ($null -eq $parent.milestone -or $parent.milestone.number -ne $milestone.number) {
        throw 'Assign PB-01 to the Sprint 01 milestone first.'
    }

    # Resolve current login from the profile URL supplied by the user.
    $thach = Invoke-GitHub -Endpoint 'users/ThachY-23120411'
    if ([string]::IsNullOrWhiteSpace($thach.login)) { throw 'Could not resolve Thach Y profile. No changes made.' }
    Write-Host "Thach Y: display name = '$($thach.name)' | GitHub login = '$($thach.login)' | $($thach.html_url)"
    foreach ($task in $plan.tasks) {
        if ($task.id -in @('TASK-07', 'TASK-08', 'TASK-09')) { $task.assignee = $thach.login }
    }
    foreach ($login in @($plan.tasks.assignee | Sort-Object -Unique)) {
        # 204 means this user can be assigned issues in this repository.
        $null = Invoke-GitHub -Endpoint "repos/$repo/assignees/$login"
    }
    $existing = @(Get-Pages -Endpoint "repos/$repo/issues?state=all" | Where-Object { -not $_.pull_request })
    $children = @(Get-Pages -Endpoint "repos/$repo/issues/$parentNumber/sub_issues")
    $byCode = @{}
    $preview = @()
    foreach ($task in $plan.tasks) {
        $pattern = '^(?:\[' + [regex]::Escape($task.id) + '\]|' + [regex]::Escape($task.id) + '\b)'
        $matchesForTask = @($existing | Where-Object { $_.title -match $pattern })
        if ($matchesForTask.Count -gt 1) { throw "Duplicate issues found for $($task.id). Resolve them before running this script." }
        $bodyPath = Join-Path $PSScriptRoot $task.body_file
        if (-not (Test-Path -LiteralPath $bodyPath)) { throw "Missing file: $bodyPath" }
        $action = 'CREATE'
        $number = '-'
        if ($matchesForTask.Count -eq 1) {
            $issue = $matchesForTask[0]
            Assert-Assignment -Issue $issue -Login $task.assignee -MilestoneNumber $milestone.number -AllowMissing
            $byCode[$task.id] = $issue
            $action = 'REUSE (fill missing assignee/milestone; link to PB-01)'
            $number = "#$($issue.number)"
        }
        $preview += [pscustomobject]@{Task=$task.id; Issue=$number; Assignee=$task.assignee; Hours=$task.estimate_hours; Action=$action}
    }
    $preview | Format-Table -AutoSize | Out-Host
    Write-Host "Parent: $($parent.html_url) | Milestone: $($milestone.title) | Due: $($milestone.due_on)"
    if (-not $Apply) {
        Write-Host 'PREVIEW ONLY. No GitHub changes. To apply: .\Setup-Sprint01.ps1 -Apply'
        exit 0
    }

    $report = @()
    foreach ($task in $plan.tasks) {
        if ($byCode.ContainsKey($task.id)) {
            $issue = $byCode[$task.id]
            $patch = @{}
            if (@($issue.assignees).Count -eq 0) { $patch.assignees = @($task.assignee) }
            if ($null -eq $issue.milestone) { $patch.milestone = [int]$milestone.number }
            if ($patch.Count -gt 0) {
                $issue = Invoke-GitHub -Endpoint "repos/$repo/issues/$($issue.number)" -Method PATCH -Payload $patch
            }
        }
        else {
            $body = Get-Content -LiteralPath (Join-Path $PSScriptRoot $task.body_file) -Raw -Encoding UTF8
            $body = [regex]::Replace($body, '(?m)^\*\*Product Backlog:\*\*.*$', "**Product Backlog:** $($parent.html_url) - PB-01")
            $body = $body.Replace('@ThachY-23120411', ('@' + $thach.login))
            $payload = @{title=$task.title; body=$body; assignees=@($task.assignee); milestone=[int]$milestone.number}
            # Do not automatically retry a failed POST: rerun the script to discover whether it was created.
            $issue = Invoke-GitHub -Endpoint "repos/$repo/issues" -Method POST -Payload $payload
        }
        Assert-Assignment -Issue $issue -Login $task.assignee -MilestoneNumber $milestone.number
        if ($issue.id -notin @($children | ForEach-Object { $_.id })) {
            # No replace_parent: an existing relationship must never be silently moved.
            $null = Invoke-GitHub -Endpoint "repos/$repo/issues/$parentNumber/sub_issues" -Method POST -Payload @{sub_issue_id=[long]$issue.id}
        }
        $byCode[$task.id] = $issue
        $report += [pscustomobject]@{Task=$task.id; Issue=$issue.number; URL=$issue.html_url; Assignee=$task.assignee; Hours=$task.estimate_hours}
        $report | Export-Csv -LiteralPath (Join-Path $PSScriptRoot 'created-issues.csv') -NoTypeInformation -Encoding UTF8
        Write-Host "OK $($task.id): $($issue.html_url) -> $($task.assignee)"
    }
    $actualChildren = @(Get-Pages -Endpoint "repos/$repo/issues/$parentNumber/sub_issues")
    foreach ($task in $plan.tasks) {
        $actual = Invoke-GitHub -Endpoint "repos/$repo/issues/$($byCode[$task.id].number)"
        Assert-Assignment -Issue $actual -Login $task.assignee -MilestoneNumber $milestone.number
        if ($actual.id -notin @($actualChildren | ForEach-Object { $_.id })) { throw "Missing sub-issue relationship: $($task.id)" }
    }
    Write-Host 'VERIFIED: 19 tasks, 99 hours; correct assignees, Sprint 01 milestone, and PB-01 sub-issue relationships.'
    Write-Host 'Results: created-issues.csv. Next: configure Project board and branch rule; TASK-01 remains open until complete.'
}
catch {
    Write-Host ("STOP: " + $_.Exception.Message) -ForegroundColor Red
    Write-Host 'Some earlier operations may have completed. Fix the error and rerun: existing tasks are reused. Do not run two copies at once.'
    exit 1
}
