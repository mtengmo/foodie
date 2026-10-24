import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
const version=new Date().toISOString();
function buildVersion():Plugin{return {name:'foodie-build-version',generateBundle(){this.emitFile({type:'asset',fileName:'version.json',source:JSON.stringify({version})});},configureServer(server){server.middlewares.use('/version.json',(_req,res)=>{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({version}));});}};}
export default defineConfig({plugins:[react(),buildVersion()],base:'/',define:{__APP_VERSION__:JSON.stringify(version)}});
