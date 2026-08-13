export interface PayUFormParameters {
  actionUrl: string;
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  [key: string]: any;
}

export function submitPayUForm(params: PayUFormParameters): void {
  if (typeof window === "undefined") return;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = params.actionUrl || "https://secure.payu.in/_payment";
  form.style.display = "none";

  Object.keys(params).forEach((key) => {
    if (key !== "actionUrl" && params[key] !== undefined && params[key] !== null) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(params[key]);
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
}
