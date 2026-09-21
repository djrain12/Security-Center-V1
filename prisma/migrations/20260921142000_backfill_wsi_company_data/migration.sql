UPDATE `LibraryDocument` SET `companyId` = (SELECT `id` FROM `Company` WHERE `slug` = 'wsi' LIMIT 1) WHERE `companyId` IS NULL;
DELETE old_framework FROM `ComplianceFramework` old_framework
INNER JOIN `ComplianceFramework` company_framework
  ON company_framework.`name` = old_framework.`name`
  AND company_framework.`companyId` = (SELECT `id` FROM `Company` WHERE `slug` = 'wsi' LIMIT 1)
WHERE old_framework.`companyId` IS NULL;
UPDATE `ComplianceFramework` SET `companyId` = (SELECT `id` FROM `Company` WHERE `slug` = 'wsi' LIMIT 1) WHERE `companyId` IS NULL;
