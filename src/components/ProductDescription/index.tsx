// @ts-nocheck
import "./scss/index.scss";

import isEqual from "lodash/isEqual";
import * as React from "react";

//import { Link } from "react-router-dom";
import { withRouter } from "react-router";

import { ProductVariantPicker } from "@components/organisms";
import {
  ProductDetails_product_pricing,
  ProductDetails_product_variants,
  ProductDetails_product_variants_pricing,
} from "@sdk/queries/gqlTypes/ProductDetails";
import { IProductVariantsAttributesSelectedValues, ITaxedMoney } from "@types";

import { ICheckoutModelLine } from "@sdk/repository";
import { TaxedMoney } from "../../@next/components/containers";
import AddToCart from "./AddToCart";
import { QuantityTextField } from "./QuantityTextField";

const LOW_STOCK_QUANTITY = 5;
interface ProductDescriptionProps {
  productId: string;
  productVariants: ProductDetails_product_variants[];
  name: string;
  pricing: ProductDetails_product_pricing;
  items: ICheckoutModelLine[];
  addToCart(varinatId: string, quantity?: number): void;
  setVariantId(variantId: string);
  history: object;
}

interface ProductDescriptionState {
  quantity: number;
  variant: string;
  variantStock: number;
  variantPricing: ProductDetails_product_variants_pricing;
  variantPricingRange: {
    min: ITaxedMoney;
    max: ITaxedMoney;
  };
}

class ProductDescription extends React.Component<
  ProductDescriptionProps,
  ProductDescriptionState
> {
  constructor(props: ProductDescriptionProps) {
    super(props);

    this.state = {
      quantity: 1,
      variant: "",
      variantPricing: null,
      variantPricingRange: {
        max: props.pricing.priceRange.stop,
        min: props.pricing.priceRange.start,
      },
      variantStock: null,
    };
  }

  getProductPrice = () => {
    const { variantPricingRange, variantPricing } = this.state;

    const { min, max } = variantPricingRange;
    if (variantPricing) {
      if (isEqual(variantPricing.priceUndiscounted, variantPricing.price)) {
        return <TaxedMoney taxedMoney={variantPricing.price} />;
      } else {
        return (
          <>
            <span className="product-description__undiscounted_price">
              <TaxedMoney taxedMoney={variantPricing.priceUndiscounted} />
            </span>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <TaxedMoney taxedMoney={variantPricing.price} />
          </>
        );
      }
    }
    if (isEqual(min, max)) {
      return <TaxedMoney taxedMoney={min} />;
    } else {
      return (
        <>
          <TaxedMoney taxedMoney={min} /> - <TaxedMoney taxedMoney={max} />
        </>
      );
    }
  };

  onVariantPickerChange = (
    _selectedAttributesValues?: IProductVariantsAttributesSelectedValues,
    selectedVariant?: ProductDetails_product_variants
  ) => {
    if (selectedVariant) {
      this.setState({
        variant: selectedVariant.id,
        variantPricing: selectedVariant.pricing,
        variantStock: selectedVariant.quantityAvailable,
      });
      this.props.setVariantId(selectedVariant.id);
      try {
        const currentPath = this.props.history.location.pathname; // @ts-ignore
        const attr = selectedVariant.attributes.find(a => a);
        const { attribute, values } = attr;
        const variantName = attribute.name
          .toLowerCase()
          .split(" ")
          .join("-");
        const variantValue = values
          .find(a => a)
          .name.toLowerCase()
          .split(" ")
          .join("-");
        this.props.history.push(
          `${currentPath}?${variantName}=${variantValue}`
        ); // @ts-ignore
      } catch (e) {
        console.error(e);
      }
    } else {
      /*this.setState({ variant: "", variantPricing: null });
      this.props.setVariantId("");*/
    }
  };

  canAddToCart = () => {
    const { items } = this.props;
    const { variant, quantity, variantStock } = this.state;

    const cartItem = items?.find(item => item.variant.id === variant);
    const syncedQuantityWithCart = cartItem
      ? quantity + (cartItem?.quantity || 0)
      : quantity;
    return quantity !== 0 && variant && variantStock >= syncedQuantityWithCart;
  };

  handleSubmit = () => {
    this.props.addToCart(this.state.variant, this.state.quantity);
    //this.setState({ quantity: 0 });
  };

  getAvailableQuantity = () => {
    const { items } = this.props;
    const { variant, variantStock } = this.state;

    const cartItem = items?.find(item => item.variant.id === variant);
    const quantityInCart = cartItem?.quantity || 0;
    return variantStock - quantityInCart;
  };

  handleQuantityChange = (quantity: number) => {
    this.setState({
      quantity,
    });
  };

  renderErrorMessage = (message: string) => (
    <p className="product-description__error-message">{message}</p>
  );

  getUrlVariant = () => {
    //const _this = this;
    const allVariants = this.props.productVariants;
    const { location } = this.props.history;
    let selected;
    if (location && location.search) {
      // NOTE: search value could be anything other than variant name
      const queryParamsRaw = location.search
        .split("?")
        .join("")
        .split("&");
      const queryParams = queryParamsRaw.map(qParam => {
        const parts = qParam.split("=");
        return {
          query: parts[0]
            .toLowerCase()
            .split(" ")
            .join("-"),
          value:
            parts.length > 1
              ? parts[1]
                  .toLowerCase()
                  .split(" ")
                  .join("-")
              : null,
        };
      });
      queryParams.forEach(({ query, value }) => {
        allVariants.forEach(selectedVariant => {
          const { attributes, name } = selectedVariant;
          const { attribute } = attributes.find(a => a);
          if (
            attribute.name
              .toLowerCase()
              .split(" ")
              .join("-") === query &&
            name
              .toLowerCase()
              .split(" ")
              .join("-") === value
          ) {
            selected = { selectedVariant, value: name };
          }
        });
      });
    }
    return selected;
  };

  componentDidMount() {
    //const { selectedVariant, value } = this.getUrlVariant();
    //this.onVariantPickerChange(value, selectedVariant);
  }

  render() {
    const { name } = this.props;
    const { variant, variantStock, quantity } = this.state;

    const availableQuantity = this.getAvailableQuantity();
    const isOutOfStock = !!variant && variantStock === 0;
    const isNoItemsAvailable = !!variant && !isOutOfStock && !availableQuantity;
    const isLowStock =
      !!variant &&
      !isOutOfStock &&
      !isNoItemsAvailable &&
      availableQuantity < LOW_STOCK_QUANTITY;

    return (
      <div className="product-description">
        <h3>{name}</h3>
        {isOutOfStock ? (
          this.renderErrorMessage("Out of stock")
        ) : (
          <h4>{this.getProductPrice()}</h4>
        )}
        {isLowStock && this.renderErrorMessage("Low stock")}
        {isNoItemsAvailable && this.renderErrorMessage("No items available")}
        <div className="product-description__variant-picker">
          <ProductVariantPicker
            productVariants={this.props.productVariants}
            onChange={this.onVariantPickerChange}
            selectSidebar={true}
            getUrlVariant={this.getUrlVariant}
          />
        </div>
        <div className="product-description__quantity-input">
          <QuantityTextField
            quantity={quantity}
            maxQuantity={availableQuantity}
            disabled={isOutOfStock || isNoItemsAvailable}
            onQuantityChange={this.handleQuantityChange}
            hideErrors={!variant || isOutOfStock || isNoItemsAvailable}
          />
        </div>
        <AddToCart
          onSubmit={this.handleSubmit}
          disabled={!this.canAddToCart()}
        />
        <div className="product-description__delivery-text">
          <span>The Product will be delivered to you within 8-10 days</span>
        </div>
      </div>
    );
  }
}

export default withRouter(ProductDescription);
