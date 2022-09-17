export interface Order {
  payment_method?: string;
  shipping_method?: string;
  total_shipping_fee?: string | number;
  total_price?: string | number;
  bphoneno?: string;
  baddress?: string;
  bcountry?: string;
  bstate?: string;
  bcity?: string;
  trxref?: string;
  different_address?: number;
  sfullname?: string;
  semail?: string;
  sphoneno?: string;
  scity?: string;
  sstate?: string;
  saddress?: string;
}
