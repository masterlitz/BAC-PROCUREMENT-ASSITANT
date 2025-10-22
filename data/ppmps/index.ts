

import { SavedPpmp } from '../../types';
import { agriPpmpDetailed } from './agriPpmpDetailed';
import { assessorPpmp } from './assessorPpmp';
import { bccPpmp } from './bccPpmp';
import { bcpo2026Ppmp } from './bcpo2026Ppmp';
import { bcpoPpmp } from './bcpoPpmp';
import { bcydoPpmp } from './bcydoPpmp';
import { benro2026Ppmp } from './benro2026Ppmp';
import { benroCleanAndGreenPpmp } from './benroCleanAndGreenPpmp';
import { bfpPpmp } from './bfpPpmp';
import { bhaPpmp } from './bhaPpmp';
import { bjmpPpmp } from './bjmpPpmp';
import { boysHomePpmp } from './boysHomePpmp';
import { cboPpmp } from './cboPpmp';
import { ccldoPpmp } from './ccldoPpmp';
import { ccr2026Ppmp } from './ccr2026Ppmp';
import { ceoAdminPpmp } from './ceoAdminPpmp';
import { cityEngineerElectricalPpmp as ceoElectricalPpmp } from './ceoElectricalPpmp';
import { ceoEngineeringSuppPpmp } from './ceoEngineeringSuppPpmp';
import { ceoHighwayMaintPpmp } from './ceoHighwayMaintPpmp';
import { ceoPlanningPpmp } from './ceoPlanningPpmp';
import { ceoPublicWorksPpmp } from './ceoPublicWorksPpmp';
import { ceoSpecialServicesPpmp } from './ceoSpecialServicesPpmp';
import { cgsoPpmp } from './cgsoPpmp';
import { choCombinedPpmp } from './choCombinedPpmp';
import { cityAdminPpmp } from './cityAdminPpmp';
import { cmo2026Ppmp } from './cmo2026Ppmp';
import { cmoAdminPpmp } from './cmoAdminPpmp';
import { cmoConsolidatedPpmp } from './cmoConsolidatedPpmp';
import { cmoMotorpoolPpmp } from './cmoMotorpoolPpmp';
import { coaPpmp } from './coaPpmp';
import { cpdoPpmp } from './cpdoPpmp';
import { ctoAdmin2026Ppmp } from './ctoAdmin2026Ppmp';
import { ctoCashPpmp } from './ctoCashPpmp';
import { ctoLandTaxPpmp } from './ctoLandTaxPpmp';
import { ctoLicense2026Ppmp } from './ctoLicense2026Ppmp';
import { dilg2026Ppmp } from './dilg2026Ppmp';
import { dilgKp2026Ppmp } from './dilgKp2026Ppmp';
import { dilgPocPpmp } from './dilgPocPpmp';
import { dledipPpmp } from './dledipPpmp';
import { drrmoPpmp } from './drrmoPpmp'; 
import { dssd2026Ppmp } from './dssd2026Ppmp';
import { hrmsPpmp } from './hrmsPpmp'; // This now imports the detailed data
import { ias2025Ppmp } from './ias2025Ppmp'; 
import { jjwcPpmp } from './jjwcPpmp';
import { legalPpmp } from './legalPpmp'; 
import { library2026Ppmp } from './library2026Ppmp';
import { marketsPpmp } from './marketsPpmp';
import { masoPpmp } from './masoPpmp';
import { mtccPpmp } from './mtccPpmp';
import { mitcsPpmp } from './mitcsPpmp';
import { oboPpmp } from './oboPpmp';
import { ocaPpmp } from './ocaPpmp';
import { paadPpmp } from './paadPpmp';
import { pesoPpmp } from './pesoPpmp';
import { popcomPpmp } from './popcomPpmp';
import { poso2026Ppmp } from './poso2026Ppmp';
import { prosecutorPpmp } from './prosecutorPpmp';
import { spPpmp } from './spPpmp';
import { tourism2026GFPpmp } from './tourism2026GFPpmp';
import { tourism2026TDFPpmp } from './tourism2026TDFPpmp';

export const allPpmps: SavedPpmp[] = [
    agriPpmpDetailed,
    assessorPpmp,
    bccPpmp,
    bcpo2026Ppmp,
    bcpoPpmp,
    bcydoPpmp,
    benro2026Ppmp,
    benroCleanAndGreenPpmp,
    bfpPpmp,
    bhaPpmp,
    bjmpPpmp,
    boysHomePpmp,
    cboPpmp,
    ccldoPpmp,
    ccr2026Ppmp,
    ceoAdminPpmp,
    ceoElectricalPpmp,
    ceoEngineeringSuppPpmp,
    ceoHighwayMaintPpmp,
    ceoPlanningPpmp,
    ceoPublicWorksPpmp,
    ceoSpecialServicesPpmp,
    cgsoPpmp,
    choCombinedPpmp,
    cityAdminPpmp,
    cmo2026Ppmp,
    cmoAdminPpmp,
    cmoConsolidatedPpmp,
    cmoMotorpoolPpmp,
    coaPpmp,
    cpdoPpmp,
    ctoAdmin2026Ppmp,
    ctoCashPpmp,
    ctoLandTaxPpmp,
    ctoLicense2026Ppmp,
    dilg2026Ppmp,
    dilgKp2026Ppmp,
    dilgPocPpmp,
    dledipPpmp,
    drrmoPpmp,
    dssd2026Ppmp,
    hrmsPpmp,
    ias2025Ppmp,
    jjwcPpmp,
    legalPpmp,
    library2026Ppmp,
    marketsPpmp,
    masoPpmp,
    mtccPpmp,
    mitcsPpmp,
    oboPpmp,
    ocaPpmp,
    paadPpmp,
    pesoPpmp,
    popcomPpmp,
    poso2026Ppmp,
    prosecutorPpmp,
    spPpmp,
    tourism2026GFPpmp,
    tourism2026TDFPpmp,
].filter(Boolean);