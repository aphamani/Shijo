const axios = require('axios');
const log = require('log4js').getLogger("Twitch-Event");
const TwitchJs = require('twitch-js').default


module.exports = async function twitchIsLive(shijo){

    const clientId = process.env.clientIdTwitch;
    const clientSecret = process.env.clientSecret;
    const username = 'Shijo';
    let token;


    const body = {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        };

        
    try 
        {     

            const response = await axios('https://id.twitch.tv/oauth2/token',{
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify(body)
              }).then(function (response) {
                return response.data;
              });

            token = response.access_token;
          
            } catch (error) {
              log.error(error);
            }


    const twitchJs = new TwitchJs({ username, token, clientId });
    twitchJs.api.get('streams', { search: { user_login: process.env.channelTwitchName } })
        .then(response => {
            if(response.data.length > 0){
                console.log(response.data);
                log.info("Chaine de "+process.env.channelTwitchName+" en live !");
                shijo.user.setActivity(process.env.channelTwitchName, { name :response.data.title, type : "STREAMING", url: "https://www.twitch.tv/"+process.env.channelTwitchName});
            }
            else{
                shijo.user.setPresence({activities:[],status: 'online'});
            }
        });
}