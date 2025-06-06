# ProtoType by Lorem Ipsum

## Roster 

**Project Manager:** Aidan Wong

Chloe Wong

Princeden Hom

Sascha Gordon-Zolov

## Site Description

Typing is an extremely useful skill, one that is used daily in all of our lives. However, often the limiting factor with typing has to do with speed. Our website, ProtoType, is set on trying to fix that in a fun way. ProtoType is a typing game centered around improving one’s typing speed. We will have two main game modes for typing: individual and multiplayer. In singleplayer users will have the ability to see how fast they are able to type in custom time intervals. They will still be able to compare against their friends, through leaderboard and user profile stats. Additionally, in multiplayer users will be able to race each other, with the results rewarding users who type both fast and accurately.

ProtoType also has a second life, one that lives in LaTeX. While some of us can type quickly (even fast enough to almost keep up with one’s thoughts!), there is no doubt that typing in LaTeX is slow and hard. Typing math can be really painful, despite how beautiful the result is. In ProtoType, one will be able to switch to a “LaTeX” mode. Here, an equation will be rendered and displayed. Users will be asked to type the equation in LaTeX, under the same settings as can found in the standard game. Multiple different ways to write identical terms will be accepted, and any other tips/question answers will be displayed in the home LaTeX page. 



# Install Guide

**Prerequisites**

Ensure that **Git** and **Node** are installed on your machine. For help, refer to the following documentation:
   1. Installing Git: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git 
   2. Installing Node: https://nodejs.org/en/download

        a. If Node is already installed (but the version is old), follow these steps to update it:

        b. Install Node Version Manager (NVM): ```curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash```

        c. Restart terminal (Close and open)

        d. Install new Node Version: ```nvm install --lts```

        e. Use newer Node Version: ```nvm use --lts```

   3. (Optional) Setting up Git with SSH (Ms. Novillo's APCSA Guide): https://novillo-cs.github.io/apcsa/tools/ 
         

**Cloning and Installing Project Dependencies**
1. In terminal, clone the repository to your local machine: 

HTTPS METHOD (Recommended)

```
$ git clone https://github.com/awong50/Lorem-Ipsum__aidanw26_alexanderg311_chloew41_princedenh2.git    
```

SSH METHOD (Requires SSH Key to be set up):

```
$ git clone git@github.com:awong50/Lorem-Ipsum__aidanw26_alexanderg311_chloew41_princedenh2.git
```

2. Navigate to project directory

```
$ cd PATH/TO/Lorem-Ipsum__aidanw26_alexanderg311_chloew41_princedenh2
```

3. Install front end dependencies

```
$ npm install
```
4. Navigate to server directory
```
$ cd PATH/TO/Lorem-Ipsum__aidanw26_alexanderg311_chloew41_princedenh2/server
```
5. Install server dependencies
```
$ npm install
```
6. Install additional dependency for ts-node (necessary to run the server locally)
```
$ npm install -D tslib @types/node
```
# Launch Codes

## Best Way

1. Visit https://prototype.awong50.tech/ on any modern browser
2. Enjoy!

## The DEVO Way

1. Navigate to server directory in the project 
```
$ cd PATH/TO/Lorem-Ipsum__aidanw26_alexanderg311_chloew41_princedenh2/server
```
2. Run the server
```
npx ts-node index.ts
```
3. Navigate back to main project directory
```
$ cd PATH/TO/Lorem-Ipsum__aidanw26_alexanderg311_chloew41_princedenh2/
```
4. Run the website locally
```
npm run dev
```

5. Open the link that appears in the terminal to be brought to the website
    - You can visit the link via several methods:
        - Control + Clicking on the link
        - Typing/Pasting http://localhost:5173/ in any browser
    - To close the app, press control + C when in the terminal

```    
  VITE v6.3.5  ready in 206 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
``` 
