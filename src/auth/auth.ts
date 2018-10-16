import request from 'request';
import q from 'q';
/**
 * Encapsulates much of the code required to get and use the on_behalf_of token
 * 
 * 10/3: Creates the access token. Does not submit the refresh token.
 * TODO: Add code for caching this token.
 * TODO: Add logic for creating a refresh token.
 * TODO: Make this 'common' and not specific to an AAD tenant instance
 */
export default class Auth {
    /**
     * The application ID generated for this application (WEB API) by Azure AD
     * This is specific to each instance of your application so best to make this an environment variable.
     */
    appId: string;
    /**
     * The app secret that can be generated for the app (WEB API) in Azure AD. 
     * Do not define this in code. USE ENVIRONMENT VARIABLES!
     */
    apiKey: string;
    /**
     * The domain for your Azure AD tenant (e.g. microsoft.onmicrosoft.com)
     * Not necessarily secret but because this will be specific to each instance of an this WEB API, best to make it an environment
     * variable as well.
     */
    tenantId: string;

    constructor(){     
        this.loadEnvironmentVariables();   
    }
    /**
     * Loads all of the environment variables. 
     */
    loadEnvironmentVariables(): void {
        this.appId = process.env.SERVER_APP_ID;
        this.apiKey = process.env.API_KEY;
        this.tenantId = process.env.TENANT_ID;
    }

    /**
     * Asyncronously retrieves the on_behalf_of Bearer token from the resource
     * @param requestToken - the access token from the calling client
     * @param apiResource  - the base URL (not full path) of the resource you're requesting. If you're request https://graph.microsoft.com/v1.0/me, this value would be https://graph.microsoft.com
     * @returns A promise containing (if successful) the Bearer token that can be added to a request for submitting an HTTP request to the specific resource
     */
    getApiToken(requestToken, apiResource): Q.Promise<any> {
        var deferred = q.defer();
        
        var config = {
            tenantid: this.tenantId,
            grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",
            client_id: this.appId,
            client_secret: this.apiKey,
            assertion: requestToken,
            requested_token_use: "on_behalf_of",
            resource:apiResource
        }
        var requestString=`https://login.microsoftonline.com/${config.tenantid}/oauth2/token`;
        console.log(`Requesting on_behalf_of access token for resource ${config.resource}`);

        console.debug(config);
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
                    console.log("Received valid token for request");
                    let dataAsJson = JSON.parse(body);
                    console.debug(`Request token: ${dataAsJson.access_token}`);
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

