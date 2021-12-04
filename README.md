# ChattR

Experimental chat app powered by WebSockets & WebRTC

## What is ChattR?

ChattR is a real-time text & video chat application based on modern web technologies. The app consists of a [React](https://reactjs.org/) based frontend and a [Node.js](https://nodejs.org/) REST API, that communicates with a [MongoDB](https://www.mongodb.com/) database.

The video & voice in calls in ChattR are handled by the open source [OpenVidu](https://openvidu.io/index) video call application platform, which uses [Kurento](https://www.kurento.org/) WebRTC media server under the hood. The real-time messaging is made possible with WebSockets using [Socket.IO](https://socket.io/)

## Features

- Sign in with Google account
- Create public or private chat rooms
- View and send text messages with optional attachments
- Make voice and video calls with other room members
- Record and download video conferencing sessions

## Screenshots

![Login screen](https://user-images.githubusercontent.com/43880678/144705633-6eac699e-0841-418f-bf6e-5b4d1d0c9bbd.jpeg)
![Messages screen](https://user-images.githubusercontent.com/43880678/144705643-5e4a01ba-2258-422d-a20b-1d3c3377f714.jpeg)
![Call screen](https://user-images.githubusercontent.com/43880678/144705645-e89dc871-8ad8-4ac6-a87b-59f6d8cfb139.jpeg)
![Create room](https://user-images.githubusercontent.com/43880678/144705736-2931af6f-40b9-4b00-82bd-038261f24a57.jpg)

## Deployment

### How to deploy for development

ChattR is a [Node.js](https://nodejs.org/) application at it's core, and uses [yarn](https://yarnpkg.com/) for package management, so install those respectively.

The ChattR backend needs a MongoDB instance for data storage. [Install MongoDB](https://www.mongodb.com/try/download) or set up a database in [MongoDB Atlas](https://www.mongodb.com/try).

If you want to be able to make video & voice calls using ChattR, you must [deploy OpenVidu platform](https://docs.openvidu.io/en/2.20.0/deployment/) on premise, or to the cloud. The OpenVidu Call application is not needed, you can disable that.

When you have MongoDB and OpenVidu ready, you can start up the development environment following these steps:

- Clone the ChattR repo
  - `git clone https://github.com/nyakaspeter/ChattR.git`
- Install dependencies with yarn
  - `yarn install`
- Set up the environmental variables for the server in a `.env` file inside the `server` directory, based on the `.env.example` file
- Once the variables are set up properly, you can start up ChattR in development mode
  - `yarn dev` (from the repo root folder)
  - If you use VSCode you can also use one of the pre-defined tasks to start the client, the server or both

### How to deploy for production as standalone application

You can deploy ChattR as a standalone application with docker-compose. If you want to be able to make video & voice calls using ChattR, you must first [deploy OpenVidu platform](https://docs.openvidu.io/en/2.20.0/deployment/) on premise, or to the cloud. The OpenVidu Call application is not needed, you can disable that.

When you have OpenVidu ready, you can deploy ChattR following these steps:

- Install docker & docker-compose if they are not already installed
- Clone the ChattR repo
  - `git clone https://github.com/nyakaspeter/ChattR.git`
- Set up the environmental variables by renaming the `.env.example` file to `.env` and setting the values. See the notes in the file for more information.
- Once the variables are set up properly, you can spin up ChattR with docker-compose
  - `docker-compose up` (from the repo root folder)

### How to deploy for production as OpenVidu based application

You can deploy ChattR alongside OpenVidu platform using the same port and SSL certificate. This way you don't have to configure the connection between the two applications and they share the same lifecycle.

More information about [deploying OpenVidu](https://docs.openvidu.io/en/2.20.0/deployment/ce/on-premises/) and [OpenVidu based applications](https://docs.openvidu.io/en/2.20.0/deployment/deploying-openvidu-apps/) can be found in the [OpenVidu docs](https://docs.openvidu.io/en/2.20.0/).

The steps of deployment are the following (you can issue these commands on basically any modern linux distribution):

- Enter root shell, you'll need it
  - `sudo su`
- Install docker
  - `curl -fsSL https://get.docker.com | bash`
- Install docker-compose
  - `curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`
  - `chmod +x /usr/local/bin/docker-compose`
- Deploy OpenVidu platform
  - `cd /opt`
  - `curl https://s3-eu-west-1.amazonaws.com/aws.openvidu.io/install_openvidu_2.20.0.sh | bash`
  - `cd openvidu`
- Clone the ChattR repo
  - `git clone https://github.com/nyakaspeter/ChattR.git`
- Override OpenVidu's default configuration files
  - `mv ./ChattR/docker-compose.openvidu.yml docker-compose.override.yml`
  - `mv ./ChattR/call_layout custom-layout`
  - `cat ./ChattR/.env.openvidu.example >> .env`
- Set up the environmental variables by editing the `.env` file, see the notes in the file for more information
  - Make sure that `SUPPORT_DEPRECATED_API` is set to false and not commented out! Otherwise OpenVidu will override the paths for the ChattR backend.
  - If you want to use the call recording feature, set `OPENVIDU_RECORDING` to true.
- Once the variables are set up properly, you can manage the lifecycle of ChattR along with the OpenVidu platform with the following commands
  - Start: `./openvidu start`
  - Stop: `./openvidu stop`
  - Restart: `./openvidu restart`
