# Test script to invoke distribute-daily-profits function
$functionUrl = "https://ukizjreylybyidbazgas.supabase.co/functions/v1/bright-worker"

Write-Host "========== TEST: Invoking distribute-daily-profits ==========" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $functionUrl `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{}' `
        -UseBasicParsing
    
    Write-Host "Success! Function called." -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
}
catch {
    Write-Host "Error calling function:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`nCheck Supabase SQL Editor to verify profits distributed." -ForegroundColor Yellow
