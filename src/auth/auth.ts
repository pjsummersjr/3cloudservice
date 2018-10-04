import request from 'request';
import q from 'q';

export default class Auth {
    
    appId: string;
    apiKey: string;
    constructor(){        
        this.appId = process.env.SERVER_APP_ID;
        this.apiKey = process.env.API_KEY;
    }

    getApiToken(requestToken, apiResource): Q.Promise<any> {
        var deferred = q.defer();
        
        var config = {
            tenantid:"microsoft.onmicrosoft.com",
            grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",
            client_id: this.appId,
            client_secret: this.apiKey,
            assertion: requestToken,
            requested_token_use: "on_behalf_of",
            resource:"https://graph.microsoft.com" //apiResource
        }

        console.log(config);
        var requestString=`https://login.microsoftonline.com/${config.tenantid}/oauth2/token`;
        
        console.debug("==============RETRIEVING SERVICE ACCESS TOKEN===================");
        console.debug(requestString);
        
        request.post({uri:requestString, form: config}, 
            function(error, res, body) {
                if(error) {
                    console.error("Error retrieving access token:");
                    console.error(error);
                    return deferred.reject(error);
                }
                if(res && res.statusCode === 200) {
                    console.log("Received valid token:");
                    let dataAsJson = JSON.parse(body);
                    console.log(dataAsJson.access_token);
                    return deferred.resolve(dataAsJson.access_token);
                }    
                else {
                    console.error(res);
                    return deferred.reject(`Invalid response returned (${res.statusCode}): ${res.statusMessage}`);
                }        
            }    
        )
        return deferred.promise;
    }
}

