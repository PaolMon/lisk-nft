/* eslint-disable @typescript-eslint/no-empty-function */
import { Application, HTTPAPIPlugin } from 'lisk-sdk';
import { NftapiPlugin } from "./plugins/nftapi/nftapi_plugin";
import { DashboardPlugin } from '@liskhq/lisk-framework-dashboard-plugin';
//import { FaucetPlugin } from '@liskhq/lisk-framework-faucet-plugin';


export const registerPlugins = (app: Application): void => {

    app.registerPlugin(NftapiPlugin);
    app.registerPlugin(HTTPAPIPlugin);
    app.registerPlugin(DashboardPlugin);
    //app.registerPlugin(FaucetPlugin);
};
