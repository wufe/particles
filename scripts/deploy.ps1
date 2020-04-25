$demoDistPath = "demo-dist"
if (Test-Path -Path $demoDistPath) {
    Remove-Item -Recurse -Force $demoDistPath
}
yarn demo:build:production
ssh do 'mkdir -p /home/particles'
ssh do 'rm -rf /home/particles/*'
scp -r $demoDistPath/* do:/home/particles
ssh do 'chmod -R 777 /home/particles'