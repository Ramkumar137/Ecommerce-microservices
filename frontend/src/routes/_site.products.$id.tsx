import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProduct } from "@/lib/mock-data";
import ProductDetails from "@/pages/customer/ProductDetails";

export const Route = createFileRoute("/_site/products/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — HeisenFlow` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [{ title: "Product not found" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductDetails,
});
