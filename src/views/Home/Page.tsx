// @ts-nocheck
import "./scss/index.scss";

import classNames from "classnames";
import * as React from "react";
import { Link } from "react-router-dom";

import { Button, Loader, ProductsFeatured } from "../../components";
import { generateCategoryUrl, generateCollectionUrl } from "../../core/utils";

import {
  ProductsList_categories,
  ProductsList_shop,
  ProductsList_shop_homepageCollection_backgroundImage,
} from "./gqlTypes/ProductsList";

import { structuredData } from "../../core/SEO/Homepage/structuredData";

import noPhotoImg from "../../images/no-photo.svg";

import Slider from "react-slick";

const Page: React.FC<{
  loading: boolean;
  categories: ProductsList_categories;
  backgroundImage: ProductsList_shop_homepageCollection_backgroundImage;
  shop: ProductsList_shop;
}> = ({ loading, categories, backgroundImage, shop }) => {
  const categoriesExist = () => {
    return categories && categories.edges && categories.edges.length > 0;
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplaySpeed: 6000,
    autoplay: true,
    draggable: true,
    //lazyLoad: "ondemand",
    adaptiveHeight: true,
  };

  return (
    <>
      <script className="structured-data-list" type="application/ld+json">
        {structuredData(shop)}
      </script>
      <div className="top-home-links">
        <ul>
          <li>
            <a href={generateCategoryUrl("Q2F0ZWdvcnk6Mg==", "LIPS")}>LIPS</a>
          </li>
          <li>
            <a href={generateCategoryUrl("Q2F0ZWdvcnk6MTM=", "EYES")}>EYES</a>
          </li>
          <li>
            <a href={generateCategoryUrl("Q2F0ZWdvcnk6NA==", "FACE")}>FACE</a>
          </li>
          <li>
            <a href={generateCategoryUrl("Q2F0ZWdvcnk6MzU=", "NAILS")}>NAILS</a>
          </li>
          <li>
            <a href={generateCategoryUrl("Q2F0ZWdvcnk6NTU=", "COMBOS")}>
              COMBOS
            </a>
          </li>
          {/*<li>
            <a href="#">DEALS</a>
          </li>*/}
        </ul>
      </div>
      <Slider {...settings}>
        <div>
          <a href={generateCollectionUrl("Q29sbGVjdGlvbjox", "Bestsellers")}>
            <img
              src="https://facescanada-store.s3.ap-south-1.amazonaws.com/website-assets/sliders/1920X764_New_1.jpg"
              width="100%"
            />
          </a>
        </div>
        <div>
          <div>
            <a href="#">
              <img
                src="https://facescanada-store.s3.ap-south-1.amazonaws.com/website-assets/sliders/1920X764_New_2.jpg"
                width="100%"
              />
            </a>
          </div>
        </div>
        <div>
          <div>
            <a href="#">
              <img
                src="https://facescanada-store.s3.ap-south-1.amazonaws.com/website-assets/sliders/1920X764_New_3.jpg"
                width="100%"
              />
            </a>
          </div>
        </div>
      </Slider>
      {/*<div
        className="home-page__hero"
        style={
          backgroundImage
            ? { backgroundImage: `url(${backgroundImage.url})` }
            : null
        }
      >
        <div className="home-page__hero-text">
          <div>
            <span className="home-page__hero__title">
              <h1>Final reduction</h1>
            </span>
          </div>
          <div>
            <span className="home-page__hero__title">
              <h1>Up to 70% off sale</h1>
            </span>
          </div>
        </div>
        <div className="home-page__hero-action">
          {loading && !categories ? (
            <Loader />
          ) : (
            categoriesExist() && (
              <Link
                to={generateCategoryUrl(
                  categories.edges[0].node.id,
                  categories.edges[0].node.name
                )}
              >
                <Button>Shop sale</Button>
              </Link>
            )
          )}
        </div>
      </div>*/}
      <ProductsFeatured title="Bestsellers" />
      {categoriesExist() && (
        <div className="home-page__categories">
          <div className="container">
            <h3>Shop by category</h3>
            <div className="home-page__categories__list">
              {categories.edges.map(({ node: category }) => (
                <div key={category.id}>
                  <Link
                    to={generateCategoryUrl(category.id, category.name)}
                    key={category.id}
                  >
                    <div
                      className={classNames(
                        "home-page__categories__list__image",
                        {
                          "home-page__categories__list__image--no-photo": !category.backgroundImage,
                        }
                      )}
                      style={{
                        backgroundImage: `url(${
                          category.backgroundImage
                            ? category.backgroundImage.url
                            : noPhotoImg
                        })`,
                      }}
                    />
                    <h3>{category.name}</h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
