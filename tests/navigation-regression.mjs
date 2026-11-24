import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base="http://127.0.0.1:3200";
const destinations=[["Categorías","categorias"],["Destacados","destacados"],["Catálogo","catalogo"],["Colección","coleccion"],["Nosotros","nosotros"]];
const sample={id:"1",slug:"white-sneakers",name:"White Sneakers",category:"sneakers",price:649000,featured:true,description:"Demo",tone:"light",image:"/products/white-sneakers/SNKRWITH1-wide.webp",variants:[{color:"Blanco",sizes:["38"],stock:{"38":3},image:"/products/white-sneakers/SNKRWITH1-wide.webp"}]};
const server=spawn("npm",["run","start"],{env:{...process.env,PORT:"3200",SUPABASE_URL:"",SUPABASE_SECRET_KEY:"",SUPABASE_SERVICE_ROLE_KEY:""},stdio:"pipe",detached:true});
server.stdout.on("data", b=>process.stdout.write(b));
server.stderr.on("data", b=>process.stderr.write(b));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(){for(let i=0;i<60;i++){try{if((await fetch(base)).ok)return}catch{}await sleep(1000)}throw Error("Next sin iniciar")}
async function test(browser,label,viewport,mobile){
 const context=await browser.newContext({viewport,deviceScaleFactor:mobile?3:1,isMobile:mobile,hasTouch:mobile,reducedMotion:"reduce"});
 const page=await context.newPage();page.setDefaultTimeout(10000);const errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 await page.route("**/api/catalog",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({configured:true,products:[sample]})}));
 await page.goto(base,{waitUntil:"domcontentloaded"});
 await page.locator("#catalogo").waitFor();
 await page.waitForTimeout(500);
 const menu=mobile||viewport.width<1024;
 const nav=page.getByRole("navigation",{name:menu?"Navegación móvil":"Principal"});
 await page.screenshot({path:"test-artifacts/nav-"+label+"-inicio.png"});
 for(let round=0;round<3;round++){
  for(const pair of destinations){
   const name=pair[0],id=pair[1];
   await page.evaluate(round=>window.scrollTo({top:round===0?0:round===1?document.body.scrollHeight/2:document.body.scrollHeight,behavior:"instant"}),round);
   await sleep(80);
   if(menu){await page.getByRole("button",{name:"Abrir menú"}).click()}
   const link=nav.getByRole("link",{name});
   const box=await link.boundingBox();assert(box,label+" elemento invisible "+name);
   assert(box.height>=40,label+" zona clicable pequeña "+name+" "+box.height+"px");
   await link.click();
   if(menu)await page.getByRole("button",{name:"Abrir menú"}).waitFor();
   await sleep(900);
   const position=await page.evaluate(id=>{const el=document.getElementById(id);return {top:el?.getBoundingClientRect().top,head:document.querySelector("header")?.getBoundingClientRect().bottom,width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}},id);
   assert(position.scrollWidth<=position.width+3,label+" overflow "+JSON.stringify(position));
   assert(position.top>=position.head-30&&position.top<=position.head+170,label+" navegación "+name+" falló "+JSON.stringify(position));
   console.log("NAV "+label+" "+name+" round "+round+" OK");
  }
 }
 if(menu){
  await page.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
  await page.getByRole("button",{name:"Abrir menú"}).click();
  await page.waitForTimeout(500);
  await page.screenshot({path:"test-artifacts/nav-"+label+"-menu.png"});
  await page.getByRole("button",{name:"Cerrar menú"}).click();
  await page.getByRole("button",{name:"Abrir menú"}).click();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("button",{name:"Abrir menú"}).getAttribute("aria-expanded"),"false");
 }else{
  const links=nav.locator("a");
  for(let i=0;i<await links.count();i++){
   const rect=await links.nth(i).boundingBox();assert(rect);
   const hit=await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.closest("a")?.getAttribute("href"),{x:rect.x+5,y:rect.y+5});
   assert.equal(hit,await links.nth(i).getAttribute("href"),"clic en borde de menú no funciona");
  }
 }
 await page.getByRole("button",{name:/Abrir carrito/}).click();
 await page.getByRole("dialog",{name:"Tu carrito"}).waitFor();
 await page.getByRole("dialog",{name:"Tu carrito"}).getByRole("button",{name:"Cerrar carrito"}).click();
 await page.screenshot({path:"test-artifacts/nav-"+label+"-final.png"});
 assert.deepEqual(errors,[],label+" errores de consola");
 console.log("NAV_"+label+"_PASS");
 await context.close();
}

async function testSmoothMotion(browser,label,viewport,mobile){
 const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,reducedMotion:"no-preference"});
 const page=await context.newPage();
 page.setDefaultTimeout(12000);
 const errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 await page.route("**/api/catalog",route=>route.fulfill({
  status:200,contentType:"application/json",
  body:JSON.stringify({configured:true,products:[sample]})
 }));
 await page.goto(base,{waitUntil:"domcontentloaded"});
 await page.locator("#catalogo").waitFor();
 await page.waitForTimeout(400);
 const nav=page.getByRole("navigation",{name:mobile?"Navegación móvil":"Principal"});
 for(const [name,id] of [["Categorías","categorias"],["Catálogo","catalogo"]]){
  for(let repeat=0;repeat<2;repeat++){
   await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));
   await sleep(150);
   if(mobile) await page.getByRole("button",{name:"Abrir menú"}).click();
   await nav.getByRole("link",{name,exact:true}).click();
   await page.waitForFunction(targetId=>{
    const target=document.getElementById(targetId);
    const header=document.querySelector("header");
    if(!target||!header)return false;
    const top=target.getBoundingClientRect().top;
    const bottom=header.getBoundingClientRect().bottom;
    return location.hash==="#"+targetId && top>=bottom-30 && top<=bottom+170;
   },id,{timeout:7000});
   if(mobile) await page.getByRole("button",{name:"Abrir menú"}).waitFor();
   console.log("NAV_SMOOTH "+label+" "+name+" "+(repeat?"repetido":"inicial")+" PASS");
  }
 }
 assert.deepEqual(errors,[],label+" errores JS en desplazamiento animado");
 await page.screenshot({path:"test-artifacts/nav-"+label+"-smooth.png"});
 await context.close();
}

try{
 await ready();await mkdir("test-artifacts",{recursive:true});
 const chrome=await chromium.launch();
 try{
  await test(chrome,"desktop",{width:1440,height:900},false);
  await test(chrome,"tablet",{width:820,height:1000},false);
  // Clic en Destacados antes de que Supabase haya enviado los productos.
  const early=await chrome.newPage({viewport:{width:1440,height:900},reducedMotion:"reduce"});
  await early.route("**/api/catalog",async route=>{
   await sleep(1000);
   await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({configured:true,products:[sample]})});
  });
  await early.goto(base,{waitUntil:"domcontentloaded"});
  await early.getByRole("navigation",{name:"Principal"}).getByRole("link",{name:"Destacados"}).click();
  await early.locator("#destacados h2").waitFor();
  await early.waitForTimeout(550);
  const location=await early.evaluate(()=>({top:document.getElementById("destacados").getBoundingClientRect().top,head:document.querySelector("header").getBoundingClientRect().bottom}));
  assert(location.top>=location.head-30&&location.top<=location.head+170,"Destacados no navega antes de cargar catálogo "+JSON.stringify(location));
  await early.screenshot({path:"test-artifacts/nav-desktop-destacados-carga-tardia.png"});
  await early.close();
  console.log("NAV_DESTACADOS_ASYNC_PASS");
  await testSmoothMotion(chrome,"desktop",{width:1440,height:900},false);
 }finally{await chrome.close()}
 const safari=await webkit.launch();
 try{await test(safari,"iphone-webkit",{width:390,height:844},true);await testSmoothMotion(safari,"iphone-webkit",{width:390,height:844},true)}finally{await safari.close()}
}catch(error){console.error(error);process.exitCode=1}
finally{try{process.kill(-server.pid,"SIGTERM")}catch{server.kill("SIGTERM")}server.stdout.destroy();server.stderr.destroy();process.exit(process.exitCode??0)}
