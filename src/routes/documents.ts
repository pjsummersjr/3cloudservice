import * as express from 'express';
import request from 'request';
import Auth from '../auth/auth';

let router = express.Router();

let authToken = null;
let apiResource = "https://graph.microsoft.com";

router.use((req, res, next) => {
    console.log("Requesting docs route");
    next();
})

/**
 * Checks for the client acceess token for this API. Need to use that to get the Bearer token for the custom web API
 */
router.use((req, res, next) => {
    if(!req.get('Authorization')){
        console.error("Did not get an authorization token in the header.");
        res.status(401);
        res.json({
            error: "No authorization token provided"
        })        
    }
    else {
        authToken = req.get('Authorization').split(' ')[1];
        next();
    }  
});

router.get('/related/:accountname', (req, res) => {
    console.log(`Retrieving related documents for ${req.params.accountname}`);
    let resourceUrl = "https://graph.microsoft.com/v1.0/me/drive/root/children?$top=3"; //search(q='FM Global')";
    resourceRequest(req, res, "https://graph.microsoft.com", resourceUrl);
});

router.get('/', (req, res) => { 
    let resourceUrl = "https://graph.microsoft.com/v1.0/me/drive/root/children";
    resourceRequest(req, res, "https://graph.microsoft.com", resourceUrl);

});

function resourceRequest(req, res, resource, resourceUrl) {
    var expressResponse = res;

    let auth = new Auth();

    auth.getApiToken(authToken, resource).then(
        function(token) {
            var options = {
                url: resourceUrl,
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                }      
            }    
            request.get(options, function(error, graphResponse, body){
                if(error) {
                    console.error(error);
                    expressResponse.status(500);
                    expressResponse.send(error);
                }
                if(graphResponse.statusCode === 200){
                    expressResponse.status(200);
                    expressResponse.json(JSON.parse(body));
                }
                else {        
                    console.error(`Error response from request URL (${graphResponse.statusCode}): ${graphResponse.statusMessage}`); 
                    console.error(graphResponse);
                    expressResponse.status(graphResponse.statusCode);
                    expressResponse.send(graphResponse.statusMessage);
                }
            });
        },
        function(error){
            expressResponse.status(500);
            expressResponse.json(JSON.parse(error));
        }
    );
}
export default router;

