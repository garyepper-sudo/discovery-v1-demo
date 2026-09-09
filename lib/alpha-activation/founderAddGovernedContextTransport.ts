/** React useActionState appends this opaque postback key. It is transport-only,
 * never enters product input, and must be singular before it is discarded. */
export function normalizeFounderAddGovernedContextActionForm(data:FormData):FormData{
 const keys=data.getAll("$ACTION_KEY");
 if(keys.length===0)return data;
 if(keys.length!==1||typeof keys[0]!=="string")throw new Error("Unexpected add-context field.");
 const normalized=new FormData();for(const[key,value]of data.entries())if(key!=="$ACTION_KEY")normalized.append(key,value);
 return normalized;
}
