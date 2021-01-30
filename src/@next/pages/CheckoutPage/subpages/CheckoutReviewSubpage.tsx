// @ts-nocheck

import React, {
  forwardRef,
  RefForwardingComponent,
  useImperativeHandle,
  useState,
} from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { CheckoutReview } from "@components/organisms";
import { statuses as dummyStatuses } from "@components/organisms/DummyPaymentGateway";
import { useCheckout } from "@sdk/react";
import { CHECKOUT_STEPS } from "@temp/core/config";
import { IFormError } from "@types";
import { Helmet } from "react-helmet";

export interface ICheckoutReviewSubpageHandles {
  complete: () => void;
}
interface IProps extends RouteComponentProps<any> {
  selectedPaymentGatewayToken?: string;
  changeSubmitProgress: (submitInProgress: boolean) => void;
}

const CheckoutReviewSubpageWithRef: RefForwardingComponent<
  ICheckoutReviewSubpageHandles,
  IProps
> = (
  { selectedPaymentGatewayToken, changeSubmitProgress, ...props }: IProps,
  ref
) => {
  const history = useHistory();
  const { checkout, payment, completeCheckout } = useCheckout();

  const [errors, setErrors] = useState<IFormError[]>([]);

  const checkoutShippingAddress = checkout?.shippingAddress
    ? {
        ...checkout?.shippingAddress,
        phone: checkout?.shippingAddress?.phone || undefined,
      }
    : undefined;

  const checkoutBillingAddress = checkout?.billingAddress
    ? {
        ...checkout?.billingAddress,
        phone: checkout?.billingAddress?.phone || undefined,
      }
    : undefined;

  const getPaymentMethodDescription = () => {
    if (payment?.gateway === "mirumee.payments.dummy") {
      return "Payment by Razorpay";
    } else if (payment?.creditCard) {
      return `Ending in ${payment?.creditCard.lastDigits}`;
    } else if (payment?.gateway === "mirumee.payments.razorpay") {
      return `Payment by Razorpay`;
    }
    return ``;
  };

  async function displayRpForm() {
    const data_raw = localStorage.getItem("data_checkout");
    const data = JSON.parse(data_raw);
    let totalAmount = 0;
    data.lines.forEach(line => {
      const { totalPrice } = line;
      totalAmount += totalPrice.net.amount;
    });
    totalAmount =
      totalAmount -
      data.promoCodeDiscount.discount.amount +
      data.shippingMethod.price.amount;

    const options = {
      //key: "rzp_test_0AIQz8jJP74GHS", // Enter the Key ID generated from the Dashboard
      key: "rzp_live_87R2OzjOC9ciNW", // Enter the Key ID generated from the Dashboard
      amount: totalAmount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "Faces Canada",
      description: "Purchase on Faces Canada website",
      receipt: `payment_${payment.id}`,
      image:
        "https://facescanada-store.s3.ap-south-1.amazonaws.com/website-assets/payment_gateway.png",
      payment_capture: 1,
      notes: {
        paymentId: String(payment.id),
      },
      handler: async function(response) {
        const { data, dataError } = await completeCheckout();
        const errors = dataError?.error;
        if (errors) {
          setErrors(errors);
        } else {
          setErrors([]);
          history.push({
            pathname: CHECKOUT_STEPS[3].nextStepLink,
            state: {
              id: data?.id,
              orderNumber: data?.number,
              token: data?.token,
            },
          });
        }
      },
      prefill: {
        email: checkout?.email,
        contact: checkout?.shippingAddress?.phone,
      },
      theme: {
        color: "#F37254",
      },
    };

    const rp = new Razorpay(options);
    rp.open();
  }

  useImperativeHandle(ref, () => ({
    complete: async () => {
      delete payment?.creditCard;
      changeSubmitProgress(true);
      displayRpForm();
      changeSubmitProgress(false);
    },
  }));

  return (
    <>
      <CheckoutReview
        {...props}
        shippingAddress={checkoutShippingAddress}
        billingAddress={checkoutBillingAddress}
        shippingMethodName={checkout?.shippingMethod?.name}
        paymentMethodName={getPaymentMethodDescription()}
        email={checkout?.email}
        errors={errors}
      />
    </>
  );
};

const CheckoutReviewSubpage = forwardRef(CheckoutReviewSubpageWithRef);

export { CheckoutReviewSubpage };
