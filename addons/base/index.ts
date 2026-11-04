import { modelRegistry } from '@allah/arsy-orm';
import { ResCompany } from './models/res_company';
import { ResCurrency } from './models/res_currency';
import { ResCountry } from './models/res_country';
import { ResPartner } from './models/res_partner';
import { ResUsers } from './models/res_users';
import { IrUiView } from './models/ir_ui_view';
import { ResLang } from './models/res_lang';
import { IrTranslation } from './models/ir_translation';

export function registerBaseAddon(): void {
  modelRegistry.register(ResCompany);
  modelRegistry.register(ResCurrency);
  modelRegistry.register(ResCountry);
  modelRegistry.register(ResPartner);
  modelRegistry.register(ResUsers);
  modelRegistry.register(IrUiView);
  modelRegistry.register(ResLang);
  modelRegistry.register(IrTranslation);
}

export * from './models/res_company';
export * from './models/res_currency';
export * from './models/res_country';
export * from './models/res_partner';
export * from './models/res_users';
export * from './models/ir_ui_view';
export * from './models/res_lang';
export * from './models/ir_translation';

