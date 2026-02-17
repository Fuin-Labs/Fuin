use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::{PriceUpdateV2, get_feed_id_from_hex};
use crate::error::ErrorCode;

// Price must be younger than 60 sec
pub const MAXIMUM_AGE: u64 = 60;
// TODO: Add more Id's & store the constants at better place
pub const PRICE_FEED_ID_SOL: &str = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";


pub fn calculate_usd_value(
    price_update: &Account<PriceUpdateV2>,
    feed_id_hex: &str,
    amount: u64,
    decimals: u8,
)->Result<u64>{
    // Get Price 
    let feed_id = get_feed_id_from_hex(feed_id_hex)?;
    let price_data = price_update.get_price_no_older_than(
        &Clock::get()?, 
        MAXIMUM_AGE, 
        &feed_id
    )?;

    // Pyth price came with an exponent 
    // We want to normalize everything to a standard USD precision (6 decimals)
    let price = price_data.price; // i64
    let price_expo = price_data.exponent; // i32

    require!(price > 0, ErrorCode::InvalidPrice);

    let u_price = price as u128;
    let u_amount = amount as u128;

    let target_decimal: i32 = 6;

    // Value = Price * Amount
    // Value = p * 10^e * amount * 10^-d (as amounts will be passed in lamports so we are converting that back to sol)
    // till now we got our answer in $USD, but we have to store that in Micro-USD so multiply by 10^6

    let total_decimals = decimals as i32 + price_expo.abs();
    let numerator = u_amount * u_price;

    if total_decimals > target_decimal {
        // We need to divide to remove extra precision
        let diff = total_decimals - target_decimal;
        let divisor = 10u128.pow(diff as u32);

        Ok((numerator / divisor) as u64)
    } else {
        // We need to multiply to add precision
        let diff = target_decimal - total_decimals;
        let multiplier = 10u128.pow(diff as u32);

        Ok((numerator * multiplier) as u64)
    }


}