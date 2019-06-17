# Hygie CLI

This project gives you a CLI tool to generate `rule` and `runnable` for the [Hygie](https://github.com/DX-DeveloperExperience/hygie) API.

> This project is based on a [LukvonStrom fork of `nest-cli`](https://github.com/LukvonStrom/nest-cli).

## Getting Started

Before started, you need to link this project, to the Hygie API.

Run the following command in this projet root folder: `npm link`.

Then, go to your Hygie root folder and run `npm link hygie-cli`.

Have a look at your node modules, you should see the `hygie-cli`.

## Usage

To generate a new `rule` or `runnable`, simply run:

```
nest generate -c hygie-cli rule|runnable yourCustomName
```
