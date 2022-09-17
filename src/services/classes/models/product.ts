export interface Product {
  available_quantity: number;
  cat_id: number;
  category: any;
  created_at: string;
  discount: any;
  estimated_time: string;
  featured: boolean;
  id: number;
  image: string;
  in_stock: boolean | number;
  is_active: boolean;
  new_price: string;
  old_price: string;
  payment_method_id: number;
  product_brand_name: string;
  product_id: number;
  product_description: string;
  product_image: string;
  product_material: string;
  product_name: string;
  product_weight: string;
  price?: string;
  production_company: string;
  promoted: boolean;
  quantity?: number;
  quantity_purchased: number;
  quantity_supplied: number;
  ratings: string;
  selling_unit: any;
  shipping_fee: string;
  single_package_size: string;
  size: string;
  sku: string;
  sub_cat_id: number;
  tags: string;
  updated_at: string;
  user_id: number;
  views: number;
}

export interface CartProduct {
  product_id?: number;
  price?: number;
  quantity?: number;
  brand_id?: number;
  color?: number;
  description?: string;
  item_description?: string;
  id?: number;
  image?: string;
  product_description?: string;
  product_image?: string;
  product_name?: string;
  quantity_ordered?: number;
  shipping_fee?: string;
  size?: string;
  cartId?: number;
  unit_price?: number;
  user?: number;
  total_price?: number;
  user_id?: number;
}
