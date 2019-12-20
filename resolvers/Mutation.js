const fetch = require("node-fetch");


const requestGithubToken = credentials => 
    fetch(
        'https://github.com/login/oauth/access_token',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(credentials)
        }
    ).then(res => res.json())

const requestGithubUserAccount = token => 
    fetch(`https://api.github.com/user?access_token=${token}`)
        .then(res => res.json())
        
const authorizeWithGithub = async credentials => {
    const { access_token } = await requestGithubToken(credentials)
    const githubUser = await requestGithubUserAccount(access_token)
    return { ...githubUser, access_token }
}


// Mutataion
module.exports = {
  async postPhoto(parent, args, { db, currentUser }) {
    
    if (!currentUser){
      throw new Error("only an authorized user can post a photo");
    }
    
    const newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date()
    }
    
    const { insertedIds } = await db.collection("photos").insert(newPhoto);

    newPhoto.id = insertedIds[0];

    return newPhoto;
  },

  async githubAuth (parent, { code }, { db }) {
    //1. 깃허브에서 데이터를 받아 옵니다.
    let {
      message,
      access_token,
      avatar_url,
      login,
      name
    } = await authorizeWithGithub({
      client_id: process.env.GIT_CLIENT_ID,
      client_secret: process.env.GIT_CLIENT_SECRET,
      code
    })
    //2. 메시지가 있다면 무언가 잘못된 것입니다.
    if (message) {
      throw new Error(message);
    }
    //3. 결과 값을 하나의 객체 안에 담습니다.
    let latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url
    }
    //4. 데이터를 새로 추가하거나 이미 있는 데이터를 업데이트 합니다.
    const {
      ops: [user]
    } = await db
      .collection("user")
      .replaceOne({ githubLogin: login}, latestUserInfo, { upsert: true})
    //5. 사용자 데이터와 토큰을 반환합니다.
    return { user, token: access_token};
  }

}