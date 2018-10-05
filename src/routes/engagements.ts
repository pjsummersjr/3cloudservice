import * as express from 'express';
import request from 'request';
import Auth from '../auth/auth';

let router = express.Router();

let authToken = null;
let apiResource = "https://mtcprod.crm.dynamics.com";

router.use((req, res, next) => {
    console.log("Requesting engagements route");
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

router.get('/', (req, res) => {
    
    var expressResponse = res;

    let auth = new Auth();

    auth.getApiToken(authToken, apiResource).then(
        function(token) {
            let crmUrl = "https://mtcprod.crm.dynamics.com/api/data/v8.2/msdyn_workorders?$top=50&$select=msdyn_name,mtc_title,mtc_goal,mtc_siebelaccountname,mtc_engagementlead,mtc_engagementnumber,msdyn_workorderid&$orderby=mtc_startdate asc&$filter=Microsoft.Dynamics.CRM.NextXMonths(PropertyName=@p1,PropertyValue=@p2)&@p1='mtc_startdate'&@p2=270";
            let options = {
                url: crmUrl,
                headers: {
                    "Authorization": token,
                    "Accept": "application/json; odata.metadata=minimal;"
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
            console.error(`Error returned from the getting API token:`);
            console.error(error);
        }
    );
})

export default router;

