# Git-Webhooks CLI

This project gives you a CLI tool to generate `rule` and `runnable` for the [Git-Webhooks](https://github.com/DX-DeveloperExperience/git-webhooks) API.

> This project is based on a [LukvonStrom fork of `nest-cli`](https://github.com/LukvonStrom/nest-cli).

## Getting Started

Before started, you need to link this project, to the Git-Webhook API.

Run the following command in this projet root folder: `npm link`.

Then, go to your Git-Webhooks root folder and run `npm run link git-webhooks-cli`.

Have a look at your node modules, you should see the `git-webhook-cli`.

## Usage

To generate a new `rule` or `runnable`, simply run:

```
nest generate -c git-webhooks-cli rule|runnable yourCustomName
```
