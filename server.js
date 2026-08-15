import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import webpush from 'web-push';
dotenv.config();
const app=express(); app.use(cors()); app.use(express.json());
const {PORT=3000,ADMIN_KEY,VAPID_SUBJECT,VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY}=process.env;
webpush.setVapidDetails(VAPID_SUBJECT,VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY);
const subscriptions=new Map();
const auth=(req,res,next)=>req.get('x-admin-key')===ADMIN_KEY?next():res.status(401).json({error:'Unauthorized'});
app.get('/api/health',(_q,r)=>r.json({ok:true}));
app.get('/api/config',(_q,r)=>r.json({vapidPublicKey:VAPID_PUBLIC_KEY}));
app.post('/api/subscribe',(req,res)=>{
 const s=req.body;
 if(!s?.endpoint||!s?.keys?.p256dh||!s?.keys?.auth)return res.status(400).json({error:'Invalid PushSubscription'});
 subscriptions.set(s.endpoint,s); res.json({ok:true});
});
async function sendRocket(){
 const payload=JSON.stringify({rocket_code:'ROCKET_KRYVYI_RIH',title:'🚀 РАКЕТА — КРИВИЙ РІГ',body:'Ракетна загроза. Перевір офіційні повідомлення.'});
 const out=[];
 for(const [endpoint,s] of subscriptions){
  try{await webpush.sendNotification(s,payload,{TTL:30,urgency:'high',topic:'rocket-alert'});out.push({ok:true});}
  catch(e){out.push({ok:false,status:e.statusCode});if(e.statusCode===404||e.statusCode===410)subscriptions.delete(endpoint);}
 }
 return out;
}
app.post('/api/test',auth,async(_q,r)=>r.json({ok:true,event:'TEST',results:await sendRocket()}));
app.post('/api/rocket',auth,async(req,res)=>{
 if(req.body?.rocket_code!=='ROCKET_KRYVYI_RIH')return res.status(400).json({error:'Expected ROCKET_KRYVYI_RIH'});
 res.json({ok:true,event:'ROCKET_KRYVYI_RIH',results:await sendRocket()});
});
app.listen(PORT,()=>console.log('RocketAlert server on '+PORT));
