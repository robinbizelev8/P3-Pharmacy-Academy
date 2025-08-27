# Singapore Healthcare Resources - Verified Links

This document tracks all verified external healthcare resource links used in P³ Pharmacy Academy to ensure they remain working and accurate.

## Verified Working Links (August 2025)

### Ministry of Health (MOH)
- **Main Website**: https://www.moh.gov.sg/ ✅ **VERIFIED**
- **Health Professionals Portal**: https://hpp.moh.gov.sg/ ✅ **VERIFIED**
- **Clinical Guidelines**: https://hpp.moh.gov.sg/guidelines ✅ **VERIFIED**
- **Health Regulations**: https://www.moh.gov.sg/others/health-regulation ✅ **VERIFIED**

### Health Sciences Authority (HSA)
- **Main Website**: https://www.hsa.gov.sg/ ✅ **VERIFIED**
- **Adverse Events Reporting**: https://www.hsa.gov.sg/adverse-events ✅ **VERIFIED**
- **E-Services Portal**: https://www.hsa.gov.sg/e-services ✅ **VERIFIED**
- **Therapeutic Products**: https://www.hsa.gov.sg/therapeutic-products/ ✅ **VERIFIED**

### Singapore Pharmacy Council (SPC)
- **Main Website**: https://www.spc.gov.sg/ ✅ **VERIFIED**
- **Guidelines for Registered Pharmacists**: https://www.spc.gov.sg/for-professionals/regulations-guidelines/ ✅ **VERIFIED**
- **Standards & Examinations**: https://www.spc.gov.sg/for-professionals/registered-pharmacists/standards-exams ✅ **VERIFIED**

### Pharmaceutical Society of Singapore (PSS)
- **Main Website**: https://pss.org.sg/ ✅ **VERIFIED**
- **Educational Resources**: Available through main website navigation

### HealthHub (Official Patient Education)
- **Main Website**: https://www.healthhub.sg/ ✅ **VERIFIED**
- **Live Healthy Resources**: https://www.healthhub.sg/live-healthy ✅ **VERIFIED**

### Singapore Medical Journal (SMJ)
- **Main Website**: https://www.smj.org.sg/ ✅ **VERIFIED**

## API and Data Access

### MOH Data Sources
- **Data.gov.sg MOH Datasets**: https://data.gov.sg/datasets?agencies=Ministry+of+Health+(MOH) ✅ **VERIFIED**
- **API Base URL**: `https://data.gov.sg/api/action/datastore_search?resource_id={dataset_id}`
- **Developer Guide**: https://guide.data.gov.sg/developer-guide/api-overview ✅ **VERIFIED**

### HSA Important Notes
- **No Public API Available**: HSA does not provide public APIs for drug safety data
- **Web-based Access Only**: All HSA resources require web interface access
- **Alternative**: Monitor HSA announcements and safety alerts pages for updates

## Link Validation Status

### Updated Links (August 2025)
1. **MOH Guidelines**: Changed from `/hpp/all-healthcare-professionals/guidelines/details/clinical-practice-guidelines` to `/guidelines`
2. **HSA Safety**: Changed from `/announcements/safety-alerts-and-recalls` to `/adverse-events`
3. **PSS Correction**: Fixed reference from "PSA" to "PSS" (Pharmaceutical Society of Singapore)

### Broken/Outdated Links Removed
- Previous PSA reference was incorrect (referred to Port of Singapore Authority)
- Fixed pharmaceutical society abbreviation throughout codebase

## Monitoring Recommendations

### Regular Checks Needed
1. **Monthly Link Validation**: Test all external links for accessibility
2. **API Endpoint Monitoring**: Verify Data.gov.sg API responses
3. **Content Updates**: Check for new guidelines and resources
4. **Contact Information**: Ensure agency contact details remain current

### Fallback Strategies
1. **Primary Link Failure**: Redirect to main agency website
2. **API Unavailable**: Use cached content with timestamp notification
3. **Content Missing**: Display error message directing users to contact support

## Integration Points in P³ Pharmacy Academy

### Server-side Integration
- **File**: `server/services/web-search.ts`
- **Function**: `getAuthenticSingaporeResources()`
- **Resources Used**: All verified links above

### Frontend Display
- Resources displayed in Prepare module
- Links open in new tabs/windows
- User guidance for accessing external content

## Contact Information for Link Issues

### If Links Become Unavailable
1. **MOH**: Contact through https://ask.gov.sg/moh
2. **HSA**: Email queries to their official channels
3. **SPC**: Use contact form on website
4. **PSS**: Direct contact through main website

### Escalation Process
1. Check for temporary outages (24-48 hours)
2. Search for alternative official URLs
3. Contact agencies directly for updated links
4. Update codebase with new verified links
5. Document changes in this file

## Last Updated
**Date**: August 23, 2025  
**Verified By**: P³ Pharmacy Academy Development Team  
**Next Review**: September 23, 2025