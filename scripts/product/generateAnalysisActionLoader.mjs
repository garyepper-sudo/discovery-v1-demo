import {registerHooks} from "node:module";

const clerk=`data:text/javascript,${encodeURIComponent('export const auth=async()=>({userId:process.env.DISCOVERY_GENERATE_ANALYSIS_TEST_USER_ID??null});')}`;
const serverOnly="data:text/javascript,export default undefined";

registerHooks({
  resolve(specifier,context,nextResolve){
    if(specifier==="server-only")return{url:serverOnly,shortCircuit:true};
    if(specifier==="@clerk/nextjs/server")return{url:clerk,shortCircuit:true};
    return nextResolve(specifier,context);
  },
  load(url,context,nextLoad){
    if(url===clerk)return{format:"module",source:decodeURIComponent(url.slice(url.indexOf(",")+1)),shortCircuit:true};
    if(url===serverOnly)return{format:"module",source:"export default undefined",shortCircuit:true};
    return nextLoad(url,context);
  },
});
