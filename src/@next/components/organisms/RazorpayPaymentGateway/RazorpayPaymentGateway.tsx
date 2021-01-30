import { Formik } from "formik";
import React from "react";

import * as S from "./styles";
import { IProps } from "./types";
import { Radio } from "@components/atoms";

export const statuses2 = [
  { token: "charged", label: "Charged" },
  { token: "fully-refunded", label: "Fully refunded" },
  { token: "not-charged", label: "Not charged" },
];

/**
 * Dummy payment gateway.
 */

const RazorpayPaymentGateway: React.FC<IProps> = ({
  processPayment,
  formRef,
  formId,
  initialStatus,
}: IProps) => {
  return (
    <Formik
      initialValues={{ status: initialStatus || statuses2[0].token }}
      onSubmit={(values, { setSubmitting }) => {
        processPayment(values.status);
        setSubmitting(false);
      }}
    >
      {({
        handleChange,
        handleSubmit,
        handleBlur,
        values,
        isSubmitting,
        isValid,
      }) => (
        <S.Form id={formId} ref={formRef} onSubmit={handleSubmit}>
          {/* <input type="hidden" value="not-charged" name="status" /> */}
          <div style={{ display: "none" }}>
            {statuses2.map(({ token, label }) => {
              return (
                <S.Status key={token}>
                  <Radio
                    style={{ display: "hidden" }}
                    data-cy={`checkoutPaymentGatewayDummyStatus${token}Input`}
                    key={token}
                    type="radio"
                    name="status"
                    value={token}
                    checked={values.status === token}
                    onChange={handleChange}
                  >
                    <span
                      data-cy={`checkoutPaymentGatewayDummyStatus${token}Label`}
                    >
                      {label}
                    </span>
                  </Radio>
                </S.Status>
              );
            })}
          </div>
        </S.Form>
      )}
    </Formik>
  );
};

export { RazorpayPaymentGateway };
