# How to Deploy

## Pre-requisite
1) Download and install NodeJS its version. 
2) Run `npm install eas-cli expo-cli -g`
3) Run `eas login` and insert the Expo credentials

## IOS
1) open app.json
2) update the build number under IOS
 ``` 
 "ios": {
      ...
      "buildNumber": "2.16", // update this
     ...
    },
```
3) Run `npm run deploy:ios`
4) Enter Apple credentials along side the OTP
   - If you've logged in before, you can just say yes to reuse credentials. 
   - They might prompt to create a new certification on a first deployment, you should create it.

> IMPORTANT: if building is taking too long and you don't want your computer to be running, just cancel the wait with `ctrl+c` and run `eas submit -p ios --latest` once the app is build.


5) For now select no for notifications since we don't have it as of writing this.
6) Wait until the app has been deploy in apple, you will either receive an email or check here https://appstoreconnect.apple.com/apps
7) Select the app ![Screenshot 2022-10-13 at 3.08.30 PM.png](/.attachments/Screenshot%202022-10-13%20at%203.08.30%20PM-b8b16870-a51b-44bd-905e-2221082dd34a.png)
8) Open the TestFlight Tab on the top and under build. !![image.png](/.attachments/image-d48ed32a-c323-482a-aa54-e8e5acc4b2ff.png)
9) In the correct version find the build you've just deployed. Under status it should ask you to complete a compliance quiz. Once it is done, it will be fully deployed.