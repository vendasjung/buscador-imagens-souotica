import * as XLSX from 'xlsx';
const text=v=>String(v??'').trim();
const key=v=>text(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const read=(row,names)=>{for(const n of names){const k=Object.keys(row).find(h=>key(h)===key(n));if(k&&text(row[k]))return text(row[k]);}return '';};
export const CATEGORIES={SOLAR:{id:'161',name:'Óculos de Sol'},RECEITUARIO:{id:'162',name:'Óculos de Grau'},RELOGIO:{id:'194',name:'Relógios'},IA:{id:'223',name:'Óculos com I.A.'}};
const number=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:'';};
export function classifySavwin(row){
 const raw=read(row,['Tipo de Prdouto','Tipo de Produto','Tipo Produto']).toUpperCase();
 if(/RELOG|RELÓG/.test(raw))return CATEGORIES.RELOGIO;
 if(/RECEIT|GRAU|ARMA[ÇC]/.test(raw))return CATEGORIES.RECEITUARIO;
 if(/SOLAR|SOL|SUN/.test(raw))return CATEGORIES.SOLAR;
 return null;
}
export function buildTrayDrafts(savwinRows,referenceRows,referenceColumns){
 const columns=referenceColumns||[];
 const bySku=new Map(referenceRows.map(r=>[text(r['Referência']||r['Código produto']),r]).filter(x=>x[0]));
 return savwinRows.map((r,index)=>{
  const sku=read(r,['Código','Código Interno']);
  const brand=read(r,['Grife','Marca']);
  const model=read(r,['Modelo']);
  const color=read(r,['Cor Numérica','Código Cor']);
  const colorName=read(r,['Cor']);
  const size=read(r,['Tamanho']);
  const cat=classifySavwin(r);
  const previous=bySku.get(sku)||{};
  const draft=Object.fromEntries(columns.map(c=>[c,text(previous[c])]));
  const set=(c,v)=>{if(columns.includes(c)&&v!==''&&v!==null&&v!==undefined)draft[c]=String(v)};
  const title=[brand,model,color].filter(Boolean).join(' ');
  set('Nome produto',title);set('Marca',brand);set('Modelo',model);set('Referência',sku);
  set('Preço venda',number(read(r,['Preço de Venda','Preco Venda'])));
  set('Preço de custo',number(read(r,['Preço de Custo'])));
  set('Estoque atual',number(read(r,['Quantidade','Estoque'])));
  set('Característica: Marca',brand);
  if(cat){set('Código categoria',cat.id);set('Nome categoria',cat.name);}
  // Standard shipping measurements apply only to eyewear and never overwrite existing product values.
  if(cat&&cat!==CATEGORIES.RELOGIO){for(const [field,value] of Object.entries({'Peso':'400','Comprimento':'15','Largura':'15','Altura':'15'})){if(!text(draft[field]))set(field,value);}}
  // Product-specific attributes are only populated from explicit SavWin fields; never guessed from another product.
  for(const [field,aliases] of Object.entries({'Característica: Formato':['Formato','Formato Armação','Formato da Armação'],'Característica: Material':['Material','Material Armação','Material da Armação'],'Característica: Gênero':['Gênero','Genero','Sexo','Público']})){if(!text(draft[field]))set(field,read(r,aliases));}
  const missing=[];
  if(!sku)missing.push('Código');if(!brand)missing.push('Grife');if(!model)missing.push('Modelo');if(!color)missing.push('Cor Numérica');if(!cat)missing.push('Categoria não reconhecida');
  if(!draft['Imagem principal'])missing.push('Imagem principal');
  if(!draft['Descrição grande'])missing.push('Descrição');
  if(cat&&cat!==CATEGORIES.RELOGIO){for(const field of ['Característica: Formato','Característica: Material','Característica: Gênero'])if(!draft[field])missing.push(field.replace('Característica: ',''));}
  return {id:index+1,sku,brand,model,color,colorName,size,category:cat?.name||'',draft,missing,ready:missing.length===0};
 });
}
export function readCsvReference(fileBuffer){
 const wb=XLSX.read(fileBuffer,{type:'array',codepage:1252});
 const sheet=wb.Sheets[wb.SheetNames[0]];
 const rows=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false});
 const headers=XLSX.utils.sheet_to_json(sheet,{header:1})[0]||[];
 return {rows,columns:headers.map(text).filter(Boolean)};
}
export function exportDraftCsv(drafts,columns){
 const rows=drafts.map(x=>Object.fromEntries(columns.map(c=>[c,x.draft[c]??''])));
 const sheet=XLSX.utils.json_to_sheet(rows,{header:columns});
 return '\ufeff'+XLSX.utils.sheet_to_csv(sheet,{FS:';',RS:'\r\n'});
}
