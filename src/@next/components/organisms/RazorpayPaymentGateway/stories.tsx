import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import React from "react";

import { RazorpayPaymentGateway } from ".";

const processPayment = action("processPayment");

storiesOf("@components/organisms/RazorpayPaymentGateway", module)
  .addParameters({ component: RazorpayPaymentGateway })
  .add("default", () => (
    <RazorpayPaymentGateway processPayment={processPayment} />
  ));
