// @ts-nocheck
import { smallScreen } from "../../globalStyles/scss/variables.scss";

import classNames from "classnames";
import * as React from "react";
import Media from "react-media";

import { CachedImage, Thumbnail } from "@components/molecules";

import { Breadcrumbs, ProductDescription } from "../../components";
import { generateCategoryUrl, generateProductUrl } from "../../core/utils";
import GalleryCarousel from "./GalleryCarousel";
import { ProductDetails_product } from "./gqlTypes/ProductDetails";
import OtherProducts from "./Other";

import { ICheckoutModelLine } from "@sdk/repository";
import { ProductDescription as NewProductDescription } from "../../@next/components/molecules";
import { ProductGallery } from "../../@next/components/organisms/";

import { structuredData } from "../../core/SEO/Product/structuredData";

import { withRouter } from "react-router";

class Page extends React.PureComponent<
  {
    product: ProductDetails_product;
    add: (variantId: string, quantity: number) => any;
    items: ICheckoutModelLine[];
  },
  { variantId: string }
> {
  fixedElement: React.RefObject<HTMLDivElement> = React.createRef();
  productGallery: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      variantId: "",
    };
  }

  setVariantId = (id: string) => {
    this.setState({ variantId: id });
  };

  get showCarousel() {
    return this.props.product.images.length > 1;
  }

  populateBreadcrumbs = product => [
    {
      link: generateCategoryUrl(product.category.id, product.category.name),
      value: product.category.name,
    },
    {
      link: generateProductUrl(product.id, product.name),
      value: product.name,
    },
  ];

  getImages = () => {
    const { product } = this.props;
    if (product.variants && this.state.variantId) {
      const variant = product.variants
        .filter(variant => variant.id === this.state.variantId)
        .pop();
      if (variant.images.length > 0) {
        return variant.images;
      } else {
        return product.images;
      }
    } else {
      return product.images;
    }
  };

  renderImages = product => {
    const images = this.getImages();
    if (images && images.length) {
      return images.map(image => (
        <a href={image.url} target="_blank">
          <CachedImage url={image.url} key={image.id}>
            <Thumbnail source={product} />
          </CachedImage>
        </a>
      ));
    }
    return <CachedImage />;
  };

  getUrlVariant = () => {
    //const _this = this;
    const allVariants = this.props.product.variants;
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
    const { product } = this.props;
    const urlVariant = this.getUrlVariant();
    if (urlVariant) {
      const { selectedVariant } = urlVariant;
      const variantId = selectedVariant.id;
      this.setVariantId(variantId);
    } else {
      const variantId = product.variants.find(a => a).id;
      this.setVariantId(variantId);
    }
  }

  render() {
    const { product } = this.props;

    const productDescription = (
      <ProductDescription
        items={this.props.items}
        productId={product.id}
        name={product.name}
        productVariants={product.variants}
        pricing={product.pricing}
        addToCart={this.props.add}
        setVariantId={this.setVariantId}
        history={this.props.history}
      />
    );
    return (
      <div className="product-page">
        <div className="container">
          <Breadcrumbs breadcrumbs={this.populateBreadcrumbs(product)} />
        </div>
        <div className="container">
          <div className="product-page__product">
            {/* Add script here */}
            <script className="structured-data-list" type="application/ld+json">
              {structuredData(product)}
            </script>

            {/*  */}
            <Media query={{ maxWidth: smallScreen }}>
              {matches =>
                matches ? (
                  <>
                    <GalleryCarousel images={this.getImages()} />
                    <div className="product-page__product__info">
                      {productDescription}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="product-page__product__gallery"
                      ref={this.productGallery}
                    >
                      <ProductGallery images={this.getImages()} />
                    </div>
                    <div className="product-page__product__info">
                      <div
                        className={classNames(
                          "product-page__product__info--fixed"
                        )}
                      >
                        {/*<p>This is a product description</p>*/}
                        {productDescription}
                      </div>
                    </div>
                  </>
                )
              }
            </Media>
          </div>
        </div>
        <div className="container">
          <div className="product-page__product__description">
            <NewProductDescription
              descriptionJson={product.descriptionJson}
              attributes={product.attributes}
            />
          </div>
        </div>
        <OtherProducts products={product.category.products.edges} />
      </div>
    );
  }
}

export default withRouter(Page);
