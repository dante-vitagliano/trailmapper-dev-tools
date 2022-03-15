# typescript-server-utilities
Released by Trailmapper for the benefit of the open source community

## Management
This repo is managed by Trailmapper and Brendan Manning.

## Contributing
To contribute, please submit a pull request for approval. By submitting a pull request, you acknowledge that you have the legal right to make it available as a part of typescript-server-utilities under the MIT License, and that you agree to release it under such license. 

## Problem
The Serverless Framework is a powerful way to write AWS Lambda functions. However, the default templates generated for typescript use 4 files to make each endpoint and require a lot of code repetition. Similarly, the typeorm library has some quirks when combined with serverless. This library speeds up the development process by making each endpoint a single file with parameter validation, permission management, user account resolution (w Auth0), etc.

## Use
1. Include the files in your codebase (npm package coming someday)
2. Delete the existing serverless functions
3. Add a folder at `src/endpoints/` (or copy the one from here)
4. Create your endpoints based off the `SampleEndpoint.ts` file
5. Define an API in Auth0 (if you want to use Auth0)
    * You can also use other underlying Auth providers. You'll just have to modify the `User.ts` file, remove the `Auth0.ts` file and deal with the verifying the JWT yourself
6. Define your ORM entities (if you want to use typeorm)
    * Otherwise, delete the `src/orm` folder and remove all references to it
    * You may have to correct by re-defining some interfaces like User (or replacing with custom functionality)
W. Edit the `Endpoints.ts` file to import and include every endpoint class you make (this is how you link/publish your endpoint)
X. In the `serverless.ts` file, change the line that says functions to be something like
``` typescript
const serverlessConfiguration: AWS = {
    ...
    functions: Handlers
}
```