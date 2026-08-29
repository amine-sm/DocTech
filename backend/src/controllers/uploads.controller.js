async function uploadImage(req,res){if(!req.file)return res.status(400).json({ok:false,message:'Image obligatoire.'});const base=(process.env.PUBLIC_BACKEND_URL||`${req.protocol}://${req.get('host')}`).replace(/\/$/,'');res.status(201).json({ok:true,data:{filename:req.file.filename,url:`${base}/uploads/${req.file.filename}`}})}
module.exports={uploadImage};
