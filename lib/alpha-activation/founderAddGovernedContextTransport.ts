/** React/Next Server Actions reserve this exact case-sensitive transport namespace. */
export function normalizeFounderAddGovernedContextActionForm(data:FormData):FormData{
 const normalized=new FormData();for(const[key,value]of data.entries())if(!key.startsWith("$ACTION_"))normalized.append(key,value);
 return normalized;
}
