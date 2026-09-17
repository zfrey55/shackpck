import type { ProductLine } from '@/lib/product-lines';
import {
  CUSTOM_PRODUCT,
  INQUIRY_LINE_LABELS,
  PACKS_PER_SET,
  PACKS_PER_SET_LABELS,
  RECOMMEND_PRODUCT,
  SETS_PER_MONTH,
  SPECIAL_PRODUCT_LABELS,
  type LineDetail,
  type ProductsByLine,
} from '@/lib/contact-inquiry';
import { ChoiceGroup } from './fields';
import type { Errors, FormState } from './inquiry-state';

type Props = {
  form: FormState;
  errors: Errors;
  productsByLine: ProductsByLine;
  onLineChange: (line: ProductLine, patch: Partial<LineDetail>) => void;
};

/** Buying step 2: one block per selected line. */
export function LineDetailsStep({ form, errors, productsByLine, onLineChange }: Props) {
  return (
    <div className="space-y-8">
      {form.productLines.map((line) => {
        const detail = form.lineDetails[line] ?? { products: [], packsPerSet: '', setsPerMonth: '' };
        const products = productsByLine[line];
        // A line with no purchasable products offers only "Custom / not sure".
        const productOptions =
          products.length > 0
            ? [...products.map((p) => ({ value: p.id, label: p.name })), { value: RECOMMEND_PRODUCT, label: SPECIAL_PRODUCT_LABELS[RECOMMEND_PRODUCT] }]
            : [{ value: CUSTOM_PRODUCT, label: SPECIAL_PRODUCT_LABELS[CUSTOM_PRODUCT] }];
        const toggleProduct = (value: string) =>
          onLineChange(line, {
            products: detail.products.includes(value)
              ? detail.products.filter((p) => p !== value)
              : [...detail.products, value],
          });

        return (
          <section key={line} data-line-block={line} className="space-y-5 rounded-lg border border-slate-700 bg-slate-900/40 p-5">
            <h3 className="text-lg font-semibold text-gold">{INQUIRY_LINE_LABELS[line]}</h3>
            <ChoiceGroup
              name={`lines.${line}.products`}
              legend="Products"
              multiple
              options={productOptions}
              selected={detail.products}
              onToggle={toggleProduct}
              error={errors[`lines.${line}.products`]}
            />
            <ChoiceGroup
              name={`lines.${line}.packsPerSet`}
              legend="Packs per set"
              columns={3}
              options={PACKS_PER_SET[line].map((v) => ({ value: v, label: PACKS_PER_SET_LABELS[v] ?? v }))}
              selected={detail.packsPerSet ? [detail.packsPerSet] : []}
              onToggle={(v) => onLineChange(line, { packsPerSet: v })}
              error={errors[`lines.${line}.packsPerSet`]}
            />
            <ChoiceGroup
              name={`lines.${line}.setsPerMonth`}
              legend="Sets per month"
              columns={2}
              options={SETS_PER_MONTH.map((v) => ({ value: v, label: v }))}
              selected={detail.setsPerMonth ? [detail.setsPerMonth] : []}
              onToggle={(v) => onLineChange(line, { setsPerMonth: v })}
              error={errors[`lines.${line}.setsPerMonth`]}
            />
          </section>
        );
      })}
    </div>
  );
}
