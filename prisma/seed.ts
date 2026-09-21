import { PrismaClient, Severity, IncidentStatus, AssetType, AccessLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const ownerEmail = process.env.PLATFORM_OWNER_EMAIL;
  const ownerPassword = process.env.PLATFORM_OWNER_PASSWORD;
  const demoEmail = process.env.DEMO_USER_EMAIL;
  const demoPassword = process.env.DEMO_USER_PASSWORD;
  if (!ownerEmail || !ownerPassword || !demoEmail || !demoPassword) throw new Error('Set PLATFORM_OWNER_EMAIL, PLATFORM_OWNER_PASSWORD, DEMO_USER_EMAIL, and DEMO_USER_PASSWORD before seeding.');
  const defaultPassword = await bcrypt.hash(demoPassword, 10);
  const superPassword = await bcrypt.hash(ownerPassword, 10);
  const roles = await Promise.all([
    prisma.role.upsert({where:{name:'Super Master Admin'},update:{},create:{name:'Super Master Admin',description:'Platform owner with company subscription and tenant administration access',canViewConfidential:true}}),
    prisma.role.upsert({where:{name:'Master Admin'},update:{},create:{name:'Master Admin',description:'All modules and confidential security records',canViewConfidential:true}}),
    prisma.role.upsert({where:{name:'Admin'},update:{},create:{name:'Admin',description:'Limited administrative module access',canViewConfidential:true}}),
    prisma.role.upsert({where:{name:'IT Security Officer'},update:{},create:{name:'IT Security Officer',description:'Limited security operations access',canViewConfidential:true}}),
    prisma.role.upsert({where:{name:'IT User'},update:{},create:{name:'IT User',description:'Assigned tasks and evidence only',canViewConfidential:false}})
  ]);
  const company = await prisma.company.upsert({where:{slug:'wsi'},update:{name:'WeSupport, Incorporated',status:'ACTIVE'},create:{name:'WeSupport, Incorporated',slug:'wsi'}});
  const previousOwner = await prisma.user.findUnique({where:{email:'admin@gmail.com'}});
  if (previousOwner) await prisma.user.update({where:{id:previousOwner.id},data:{email:ownerEmail}});
  const michael = await prisma.user.upsert({where:{email:ownerEmail},update:{fullName:'Platform Owner',companyId:null,accessLevel:AccessLevel.SUPER_MASTER_ADMIN,passwordHash:superPassword,roleId:roles[0].id,emailVerifiedAt:new Date(),status:'ACTIVE'},create:{fullName:'Platform Owner',email:ownerEmail,companyId:null,department:'Cyber Security',roleId:roles[0].id,accessLevel:AccessLevel.SUPER_MASTER_ADMIN,passwordHash:superPassword,emailVerifiedAt:new Date()}});
  const tara = await prisma.user.upsert({where:{email:demoEmail},update:{companyId:company.id,accessLevel:AccessLevel.IT_SECURITY_OFFICER},create:{fullName:'Security Officer',email:demoEmail,companyId:company.id,department:'Cyber Security',roleId:roles[2].id,accessLevel:AccessLevel.IT_SECURITY_OFFICER,passwordHash:defaultPassword}});
  const gateway = await prisma.securityAsset.upsert({where:{assetTag:'SRV-001'},update:{},create:{assetTag:'SRV-001',name:'Payment Gateway Cluster',assetType:AssetType.SERVER,ownerDepartment:'Finance',criticality:Severity.CRITICAL}});
  const identity = await prisma.securityAsset.upsert({where:{assetTag:'SRV-014'},update:{},create:{assetTag:'SRV-014',name:'Identity Services',assetType:AssetType.SERVER,ownerDepartment:'MIS',criticality:Severity.CRITICAL}});
  await prisma.securityIncident.upsert({where:{incidentCode:'INC-2026-041'},update:{},create:{incidentCode:'INC-2026-041',title:'Suspicious authentication pattern',severity:Severity.HIGH,status:IncidentStatus.INVESTIGATING,assignedTo:michael.id,affectedAssetId:identity.id,detectedAt:new Date()}});
  await prisma.securityIncident.upsert({where:{incidentCode:'INC-2026-040'},update:{},create:{incidentCode:'INC-2026-040',title:'Endpoint malware quarantine',severity:Severity.MEDIUM,status:IncidentStatus.OPEN,assignedTo:tara.id,affectedAssetId:gateway.id,detectedAt:new Date(Date.now()-86400000)}});
  for (const [name, readiness] of [['SOC 2',96],['ISO 27001',93],['DPA',89]] as const) await prisma.complianceFramework.upsert({where:{companyId_name:{companyId:company.id,name}},update:{readinessPercent:readiness},create:{companyId:company.id,name,readinessPercent:readiness}});
  await prisma.securityActivity.createMany({data:[{name:'VAPT engagements',category:'VAPT',completionPercent:78,ownerId:michael.id},{name:'Patching cadence',category:'Patching',completionPercent:92,ownerId:tara.id},{name:'Access reviews',category:'Access',completionPercent:64,ownerId:michael.id},{name:'Backup verification',category:'Backup',completionPercent:100,ownerId:tara.id}]});
  const modules = ['Security Dashboard','Security Incidents','Security Events','Vulnerability Management','VAPT Management','Risk Management','Security Assets','Access Management','Network Security','Server Security','Backup Security','Security Policies','Security Awareness','Audit & Findings','SOC 2 Compliance','ISO 27001 Compliance','DPA Compliance','Security Reports','Audit Logs'];
  await prisma.userModulePermission.createMany({data:modules.map(moduleName=>({userId:michael.id,moduleName,allowed:true})),skipDuplicates:true});
  await prisma.auditLog.create({data:{actorId:michael.id,action:'SEEDED_WORKSPACE',resourceType:'security_dashboard',metadata:{source:'prisma seed'}}});
  await prisma.networkZone.createMany({data:[{name:'VLAN 25 - Office',cidr:'192.168.25.0/24',gateway:'192.168.25.1'},{name:'VLAN 26 - Office',cidr:'192.168.26.0/24',gateway:'192.168.26.1'},{name:'VLAN 27 - Management',cidr:'192.168.27.0/24',gateway:'192.168.27.1'}],skipDuplicates:true});
}
main().finally(() => prisma.$disconnect());
