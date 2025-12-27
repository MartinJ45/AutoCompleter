# AI Google Docs Autocomplete Extension
An AI-powered chrome extension that enhances your writing directly inside Google Docs, powered by the OpenAI API. 
This extension integrates with Google Docs to suggest context aware completions to unfinished sentences, accelerating writing workflows without leaving the document. 

## How It Works
1. A content script runs on Google Docs and tracks the users selected text.
2. The extension sends relevant information to the OpenAI API
3. The AI returns suggested continuation
4. The suggestion is inserted directly into the document

## Setup
Clone the repository
```bash
git clone https://github.com/MartinJ45/AutoCompleter.git
cd AutoCompleter
```
Create Google OAuth client
- Go to Google Console
- Enable the Google Docs API
- Create an OAuth 2.0 Client ID
- Copy the Client ID

Configure manifest
- Replace `YOUR_GOOGLE_OAUTH_CLIENT_ID` with your own client ID
```bash
cp manifest.template.json manifest.json
```
Load the extension in Chrome
- Visit `chrome://extensions`
- Enable Developer mode
- Click load unpacked
- Select extension folder
