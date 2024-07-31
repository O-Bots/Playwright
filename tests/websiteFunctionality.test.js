const {test, expect} = require('@playwright/test');
const account = require('./../test-data/accountDetails.json');
const contact = require('./../test-data/contactUsDetails.json');

const successfullSubscribe = 'You have been successfully subscribed!'
test.beforeEach('Pre test prep', async ({page}) => {

    //Navigate to the baseURL
    await page.goto('/');

    //Clear consent option
    await page.getByLabel('Consent', { exact: true }).click();

    //Confirm page is visible
    await page.locator(".logo.pull-left").isVisible();
});

async function createAcc (browser) {
    //Click login
    await browser.getByText(" Signup / Login").click();
    
    //Confirm login page is visible
    expect(await browser.getByRole('heading', { name: 'New User Signup!' })).toBeVisible();
    
    //Enter name and email
    await browser.getByPlaceholder('Name').fill(account.account_name);
    await browser.locator('form').filter({ hasText: 'Signup' })
    .getByPlaceholder('Email Address').fill(account.email);
    
    //Click signup
    await browser.getByRole('button', { name: 'Signup' }).click();
    
    //Confirm the page is correct
    expect(await browser.getByRole('heading', {name: 'Enter Account Information'})).toBeVisible();
    
    //Enter account information

    //Setup for choosing a random prefix
    const prefixArr = await browser.locator('[class=radio-inline]').locator('label').all();
    const prefixRng = Math.floor(Math.random() * prefixArr.length);

    //Choose a prefix
    await prefixArr[prefixRng].click();

    //Enter password
    await browser.locator('input#password').fill(account.password);

    //Enter Dob
    await browser.locator('select#days').selectOption(account.dob.days);
    await browser.locator('select#months').selectOption(account.dob.months);
    await browser.locator('select#years').selectOption(account.dob.years);

    await browser.getByRole('checkbox', {name: 'newsletter'}).check();
    await browser.locator('input#optin').check();

    //Enter address information
    await browser.locator('#first_name').fill(account.first_name);
    await browser.locator('#last_name').fill(account.last_name);
    await browser.locator('#company').fill(account.company);
    await browser.locator('#address1').fill(account.address);
    await browser.locator('select#country').selectOption(account.country);
    await browser.locator('#state').fill(account.state);
    await browser.locator('#city').fill(account.city);
    await browser.locator('#zipcode').fill(account.zipcode);
    await browser.locator('#mobile_number').fill(account.mobile_number);

    //Click submit butto to create account
    await browser.getByRole('button', {name: 'Create Account'}).click();

    //Confirm account has been created successfully
    expect(browser.getByRole('heading', {name: 'Account Created!'})).toBeVisible();

    //Click continue
    await browser.locator('.btn.btn-primary', {hasText: 'Continue'}).click();

    //Confirm account name is correct
    expect(await browser.locator('.shop-menu.pull-right').getByRole('listitem').nth(9).locator('b').innerText()).toEqual(account.account_name);
};

test('Successfully uses the contact us form', async ({page}) => {
    //Click contact us
    await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(7).click();

    //Fill in contact form info
    await page.getByTestId('name').fill(contact.first_name);
    await page.getByTestId('email').fill(contact.email);
    await page.getByTestId('subject').fill(contact.subject);
    await page.getByTestId('message').fill(contact.message);

    //Upload file
    await page.locator('#contact-us-form').locator('div').nth(4).locator('.form-control').setInputFiles('./test-data/Binks.jpg');

    //Submit contact us information
    await page.getByTestId('submit-button').click();
});

test('Sucessfully navigates to the test cases page', async ({page}) => {
    //Click the Test Cases link
    await page.locator('.item.active').locator('div').nth(0).locator('.test_cases_list').click();

    //Verify the page is correct
    expect(page.url()).toContain('test_cases');
});


test.describe('Product interaction tests', () => {
    test('Verify product page and product details', async ({page}) => {
        //Navigate to the products page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(1).click();

        //Verify the page is correct
        expect(page.url()).toContain('products');

        //Store products for later use
        const products = await page.locator('.features_items').locator('//div[@class="product-image-wrapper"]');
        const allProducts = await products.all();
        const rngProduct = Math.floor(Math.random() * allProducts.length);

        //Get product information
        const productName = await products.nth(rngProduct).locator('.productinfo.text-center').locator('p').innerText();
        const productPrice = await products.nth(rngProduct).locator('.productinfo.text-center').locator('h2').innerText();
        
        //Choose a product
        await products.nth(rngProduct).locator('.choose').click();

        //Verify the page is correct
        expect(page.url()).toContain('product_details');

        const chosenProductName = await page.locator('.product-information').locator('h2').nth(0).innerText();
        const chosenProductPrice = await page.locator('.product-information').locator('span').nth(0).locator('span').innerText();

        //Confirm product is correct
        expect(chosenProductName).toEqual(productName);
        expect(chosenProductPrice).toEqual(productPrice);
    });

    test('Sucessfully uses search functionality', async({page}) => {
        //Navigate to the products page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(1).click();

        //Verify the page is correct
        expect(page.url()).toContain('products');

        //Store products for later use
        const products = await page.locator('.features_items').locator('//div[@class="product-image-wrapper"]');
        const allProducts = await products.all();
        const rngProduct = Math.floor(Math.random() * allProducts.length);

        //Get product information
        const productName = await products.nth(rngProduct).locator('.productinfo.text-center').locator('p').innerText();

        //Search for the product
        await page.locator('#search_product').fill(productName);
        await page.locator('#submit_search').click();

        //Verify searched products information
        const searchedProductName = await page.locator('.productinfo.text-center').locator('p').innerText()
        expect(searchedProductName).toEqual(productName);
    });

    test('Successfully navigates between product categories', async({page}) => {
        //Verify that the category sidebar is visible
        expect(await page.locator('.left-sidebar >.category-products')).toBeVisible();

        //Click on women category
        const firstCategory = await page.getByRole('link', {name: 'Women'}).innerText();
        await page.getByRole('link', {name: 'Women'}).click();

        const firstSubcategory = await page.getByRole('link', {name: 'Dress'}).innerText();
        await page.getByRole('link', {name: 'Dress'}).click();

        //Verify its the correct page
        expect((await page.locator('.features_items > h2').innerText()).toLocaleLowerCase())
        .toContain(firstCategory.toLocaleLowerCase());
        expect((await page.locator('.features_items > h2').innerText()).toLocaleLowerCase())
        .toContain(firstSubcategory.toLocaleLowerCase());

        const secondCategory = await page.getByRole('link', {name: /Men/}).innerText();
        await page.getByRole('link', {name: /Men/}).click();

        const secondSubcategory = await page.getByRole('link', {name: 'Tshirts'}).textContent();
        await page.getByRole('link', {name: 'Tshirts'}).click();

        //Verify its the correct page
        expect((await page.locator('.features_items > h2').innerText()).toLocaleLowerCase())
        .toContain(secondCategory.toLocaleLowerCase());
        expect((await page.locator('.features_items > h2').innerText()).toLocaleLowerCase())
        .toContain(secondSubcategory.toLocaleLowerCase());
    });

    test('Successfully navigates between brand categories', async({page}) => {
        //Verify that the brand sidebar is visible
        expect(await page.locator('.left-sidebar > .brands_products')).toBeVisible();

        //Click on polo brand
        const firstBrand = await page.getByRole('link', {name: 'Polo'}).innerText();
        await page.getByRole('link', {name: 'Polo'}).click();

        //Verify its the correct page
        expect((await page.locator('.features_items > h2').innerText()).toLocaleLowerCase())
        .toContain(firstBrand.toLocaleLowerCase().replace(/[^Polo]/g, ''));

        const secondBrand = await page.getByRole('link', {name: 'H&M'}).innerText();
        await page.getByRole('link', {name: 'H&M'}).click();

        //Verify its the correct page
        expect((await page.locator('.features_items > h2').innerText()).toLocaleLowerCase())
        .toContain(secondBrand.toLocaleLowerCase().replace(/[^H&M]/g, ''));
    });

    test('Successfully add a review on a product', async ({page}) => {
        //Navigate to the products page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(1).click();

        //Verify the page is correct
        expect(page.url()).toContain('products');

        //Store products for later use
        const products = await page.locator('.features_items').locator('//div[@class="product-image-wrapper"]');
        const allProducts = await products.all();
        const rngProduct = Math.floor(Math.random() * allProducts.length);

        //Get product information
        const productName = await products.nth(rngProduct).locator('.productinfo.text-center').locator('p').innerText();
        const productPrice = await products.nth(rngProduct).locator('.productinfo.text-center').locator('h2').innerText();
        
        //Choose a product
        await products.nth(rngProduct).locator('.choose').click();

        //Verify the page is correct
        expect(page.url()).toContain('product_details');

        const chosenProductName = await page.locator('.product-information').locator('h2').nth(0).innerText();
        const chosenProductPrice = await page.locator('.product-information').locator('span').nth(0).locator('span').innerText();

        //Confirm product is correct
        expect(chosenProductName).toEqual(productName);
        expect(chosenProductPrice).toEqual(productPrice);

        //Verify review section is visible
        expect(await page.getByText('Write Your Review', {exact: true})).toBeVisible();

        //Enter review information
        await page.getByPlaceholder('Your Name').fill(account.first_name, account.last_name);
        await page.getByPlaceholder('Email Address').nth(0).fill(account.email);
        await page.getByPlaceholder('Add Review Here!').fill('This is my review');
        await page.getByRole('button', {name: 'Submit'}).click();

        //Verify review success
        expect(await page.locator('.alert-success').nth(0)).toBeVisible();
    });
});

test.describe('Subscription tests', () => {
    test('Sucessfully use the subscribe functinality on the home page', async ({page}) => {
        //Enter email in subscribe section
        await page.locator('#susbscribe_email').fill(contact.email);

        //Submit
        await page.locator('#subscribe').click();

        //Verify that subscription is successfull
        expect(await page.locator('.alert-success.alert').innerText()).toEqual(successfullSubscribe);
    });

    test('Successfully use subscribe functionality on cart page', async({page}) => {
        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Enter email in subscribe section
        await page.locator('#susbscribe_email').fill(contact.email);

        //Submit
        await page.locator('#subscribe').click();

        //Verify that subscription is successfull
        expect(await page.locator('.alert-success.alert').innerText()).toEqual(successfullSubscribe);
    });
});

test.describe('Cart interaction tests', () => {
    test('Successfully adds products to the cart', async({page}) => {
        //Navigate to the products page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(1).click();

        //Verify the page is correct
        expect(page.url()).toContain('products');

        //Store items information
        const products = await page.locator('.features_items').locator('//div[@class="product-image-wrapper"]');
        const firstProductName = await products.nth(0).locator('.productinfo > p').innerText();
        const firstProductPrice = await products.nth(0).locator('.productinfo > h2').innerText();
        const secondProductName = await products.nth(1).locator('.productinfo > p').innerText();
        const secondProductPrice = await products.nth(1).locator('.productinfo > h2').innerText();

        //Add first product to cart;
        await products.nth(0).locator('.productinfo.text-center > .btn').click();

        //Click continue shopping
        await page.locator('.close-modal').click();

        //Add first product to cart;
        await products.nth(1).locator('.productinfo.text-center > .btn').click();

        //Click continue shopping
        await page.locator('.close-modal').click();

        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Cart information
        const firstCartProductName = await page.locator('.cart_description').locator('a').nth(0).innerText();
        const firstCartProductPrice = await page.locator('.cart_price').locator('p').nth(0).innerText();
        const firstCartProductQuantity = await page.locator('.cart_quantity').locator('button').nth(0).innerText();
        const secondCartProductName = await page.locator('.cart_description').locator('a').nth(1).innerText();
        const secondCartProductPrice = await page.locator('.cart_price').locator('p').nth(1).innerText();
        const secondCartProductQuantity = await page.locator('.cart_quantity').locator('button').nth(1).innerText();

        //Verify product is correct
        const productsTotal = firstProductPrice.replace(/^Rs\. /, "") + secondProductPrice.replace(/^Rs\. /, "");
        const cartProductsTotal = firstCartProductPrice.replace(/^Rs\. /, "") + secondCartProductPrice.replace(/^Rs\. /, "");

        expect(firstCartProductName).toEqual(firstProductName);
        expect(firstCartProductPrice.replace(/^Rs\. /, "")).toEqual(firstProductPrice.replace(/^Rs\. /, ""));
        expect(firstCartProductQuantity).toEqual("1");
        expect(secondCartProductName).toEqual(secondProductName);
        expect(secondCartProductPrice.replace(/^Rs\. /, "")).toEqual(secondProductPrice.replace(/^Rs\. /, ""));
        expect(secondCartProductQuantity).toEqual("1");
        expect(productsTotal).toEqual(cartProductsTotal)

    });

    test('Successfully verifies product quantity in cart', async({page}) => {
        //Navigate to the products page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(1).click();

        //Verify the page is correct
        expect(page.url()).toContain('products');

        //Store products for later use
        const products = await page.locator('.features_items').locator('//div[@class="product-image-wrapper"]');
        const allProducts = await products.all();
        const rngProduct = Math.floor(Math.random() * allProducts.length);

        //Get product information
        const productName = await products.nth(rngProduct).locator('.productinfo > p').innerText();
        const productPrice = await products.nth(rngProduct).locator('.productinfo > h2').innerText();

        //Choose a product
        await products.nth(rngProduct).locator('.choose').click();

        //Verify the page is correct
        expect(page.url()).toContain('product_details');

        const chosenProductName = await page.locator('.product-information > h2').innerText();
        const chosenProductPrice = await page.locator('.product-information > span > span').innerText();

        //Confirm product is correct
        expect(chosenProductName).toEqual(productName);
        expect(chosenProductPrice).toEqual(productPrice);

        //Change quantity
        await page.locator('#quantity').clear();
        await page.locator('#quantity').fill("4");

        //Add to cart
        await page.locator('.btn.btn-default.cart').click();

        //Click continue shopping
        await page.locator('.close-modal').click();

        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Cart information
        const firstCartProductName = await page.locator('.cart_description > h4 > a').nth(0).innerText();
        const firstCartProductPrice = await page.locator('.cart_price > p').nth(0).innerText();
        const firstCartProductQuantity = await page.locator('.cart_quantity > button').nth(0).innerText();

        expect(productName).toEqual(firstCartProductName);
        expect(productPrice).toEqual(firstCartProductPrice);
        expect(firstCartProductQuantity).toEqual("4");
    });

    test('Successfully registers a new account while at the checkout', async({page}) => {
        //Navigate to the products page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(1).click();

        //Verify the page is correct
        expect(page.url()).toContain('products');

        //Store items information
        const products = await page.locator('.features_items').locator('//div[@class="product-image-wrapper"]');
        const productName = await products.nth(0).locator('.productinfo > p').innerText();
        const productPrice = await products.nth(0).locator('.productinfo > h2').innerText();

        //Add product to cart;
        await products.nth(0).locator('.productinfo.text-center > .btn').click();

        //Click continue shopping
        await page.locator('.close-modal').click();

        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Cart information
        const cartProductName = await page.locator('.cart_description').locator('a').nth(0).innerText();
        const cartProductPrice = await page.locator('.cart_price').locator('p').nth(0).innerText();
        const cartProductQuantity = await page.locator('.cart_quantity').locator('button').nth(0).innerText();

        //Verify product is correct
        expect(cartProductName).toEqual(productName);
        expect(cartProductPrice.replace(/^Rs\. /, "")).toEqual(productPrice.replace(/^Rs\. /, ""));
        expect(cartProductQuantity).toEqual("1");

        //Create account
        await createAcc(page);

        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Cart information
        const cartProductNameSecondCheck = await page.locator('.cart_description').locator('a').nth(0).innerText();
        const cartProductPriceSecondCheck = await page.locator('.cart_price').locator('p').nth(0).innerText();
        const cartProductQuantitySecondCheck = await page.locator('.cart_quantity').locator('button').nth(0).innerText();

        //Verify product is correct
        expect(cartProductNameSecondCheck).toEqual(productName);
        expect(cartProductPriceSecondCheck.replace(/^Rs\. /, "")).toEqual(productPrice.replace(/^Rs\. /, ""));
        expect(cartProductQuantitySecondCheck).toEqual("1");

        //Click checkout
        await page.locator('.check_out').click();

        //Verify the page is correct
        expect(page.url()).toContain('checkout');

        //Verify account/delivery information
        const deliveryInfo = await page.locator('#address_delivery > li');
        const billingInfo = await page.locator('#address_invoice > li');
        expect(await deliveryInfo.nth(1).innerText()).toContain(account.first_name);
        expect(await deliveryInfo.nth(1).innerText()).toContain(account.last_name);
        expect(await deliveryInfo.nth(2).innerText()).toContain(account.company);
        expect(await deliveryInfo.nth(3).innerText()).toContain(account.address);
        expect(await deliveryInfo.nth(5).innerText()).toContain(account.city);
        expect(await deliveryInfo.nth(5).innerText()).toContain(account.state);
        expect(await deliveryInfo.nth(5).innerText()).toContain(account.zipcode);
        expect(await deliveryInfo.nth(6).innerText()).toContain(account.country);
        expect(await deliveryInfo.nth(7).innerText()).toContain(account.mobile_number);

        //Verify billing info
        expect(await deliveryInfo.nth(1).innerText()).toEqual(await billingInfo.nth(1).innerText());
        expect(await deliveryInfo.nth(2).innerText()).toEqual(await billingInfo.nth(2).innerText());
        expect(await deliveryInfo.nth(3).innerText()).toEqual(await billingInfo.nth(3).innerText());
        expect(await deliveryInfo.nth(5).innerText()).toEqual(await billingInfo.nth(5).innerText());
        expect(await deliveryInfo.nth(6).innerText()).toEqual(await billingInfo.nth(6).innerText());
        expect(await deliveryInfo.nth(7).innerText()).toEqual(await billingInfo.nth(7).innerText());

        //Cart information
        const cartProductNameThirdCheck = await page.locator('.cart_description').locator('a').nth(0).innerText();
        const cartProductPriceThirdCheck = await page.locator('.cart_price').locator('p').nth(0).innerText();
        const cartProductQuantityThirdCheck = await page.locator('.cart_quantity').locator('button').nth(0).innerText();

        //Verify product is correct
        expect(cartProductNameThirdCheck).toEqual(productName);
        expect(cartProductPriceThirdCheck.replace(/^Rs\. /, "")).toEqual(productPrice.replace(/^Rs\. /, ""));
        expect(cartProductQuantityThirdCheck).toEqual("1");

        //Order message
        await page.locator('#ordermsg > textarea').fill('Description');

        //Click place order
        await page.locator('#cart_items').getByText('Place Order').click();

        //Enter payment details
        await page.getByTestId('name-on-card').fill(account.first_name, account.last_name);
        await page.getByTestId('card-number').fill(account.paymentDetails.card_number);
        await page.getByTestId('cvc').fill(account.paymentDetails.card_cvc);
        await page.getByTestId('expiry-month').fill(account.paymentDetails.card_expiry_month);
        await page.getByTestId('expiry-year').fill(account.paymentDetails.card_expiry_year);
        await page.getByTestId('pay-button').click();

        //Verify that order has been successfully placed
        expect(await page.getByTestId('order-placed')).toBeVisible();

        //Click continue
        await page.locator('.btn.btn-primary', {hasText: 'Continue'}).click();

        //Delete account
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(4).click();

        //Click continue
        await page.locator('.btn.btn-primary', {hasText: 'Continue'}).click();
    });

    test('Successfully registers a new account before checkout', async({page}) => {
        //Create account
        await createAcc(page);

        //Navigate to the products page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(1).click();

        //Verify the page is correct
        expect(page.url()).toContain('products');

        //Store items information
        const products = await page.locator('.features_items').locator('//div[@class="product-image-wrapper"]');
        const productName = await products.nth(0).locator('.productinfo > p').innerText();
        const productPrice = await products.nth(0).locator('.productinfo > h2').innerText();

        //Add product to cart;
        await products.nth(0).locator('.productinfo.text-center > .btn').click();

        //Click continue shopping
        await page.locator('.close-modal').click();

        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Cart information
        const cartProductName = await page.locator('.cart_description').locator('a').nth(0).innerText();
        const cartProductPrice = await page.locator('.cart_price').locator('p').nth(0).innerText();
        const cartProductQuantity = await page.locator('.cart_quantity').locator('button').nth(0).innerText();

        //Verify product is correct
        expect(cartProductName).toEqual(productName);
        expect(cartProductPrice.replace(/^Rs\. /, "")).toEqual(productPrice.replace(/^Rs\. /, ""));
        expect(cartProductQuantity).toEqual("1");

        //Click checkout
        await page.locator('.check_out').click();

        //Verify the page is correct
        expect(page.url()).toContain('checkout');

        //Verify account/delivery information
        const deliveryInfo = await page.locator('#address_delivery > li');
        const billingInfo = await page.locator('#address_invoice > li');
        expect(await deliveryInfo.nth(1).innerText()).toContain(account.first_name);
        expect(await deliveryInfo.nth(1).innerText()).toContain(account.last_name);
        expect(await deliveryInfo.nth(2).innerText()).toContain(account.company);
        expect(await deliveryInfo.nth(3).innerText()).toContain(account.address);
        expect(await deliveryInfo.nth(5).innerText()).toContain(account.city);
        expect(await deliveryInfo.nth(5).innerText()).toContain(account.state);
        expect(await deliveryInfo.nth(5).innerText()).toContain(account.zipcode);
        expect(await deliveryInfo.nth(6).innerText()).toContain(account.country);
        expect(await deliveryInfo.nth(7).innerText()).toContain(account.mobile_number);

        //Verify billing info
        expect(await deliveryInfo.nth(1).innerText()).toEqual(await billingInfo.nth(1).innerText());
        expect(await deliveryInfo.nth(2).innerText()).toEqual(await billingInfo.nth(2).innerText());
        expect(await deliveryInfo.nth(3).innerText()).toEqual(await billingInfo.nth(3).innerText());
        expect(await deliveryInfo.nth(5).innerText()).toEqual(await billingInfo.nth(5).innerText());
        expect(await deliveryInfo.nth(6).innerText()).toEqual(await billingInfo.nth(6).innerText());
        expect(await deliveryInfo.nth(7).innerText()).toEqual(await billingInfo.nth(7).innerText());

        //Cart information
        const cartProductNameSecondCheck = await page.locator('.cart_description').locator('a').nth(0).innerText();
        const cartProductPriceSecondCheck = await page.locator('.cart_price').locator('p').nth(0).innerText();
        const cartProductQuantitySecondCheck = await page.locator('.cart_quantity').locator('button').nth(0).innerText();

        //Verify product is correct
        expect(cartProductNameSecondCheck).toEqual(productName);
        expect(cartProductPriceSecondCheck.replace(/^Rs\. /, "")).toEqual(productPrice.replace(/^Rs\. /, ""));
        expect(cartProductQuantitySecondCheck).toEqual("1");

        //Order message
        await page.locator('#ordermsg > textarea').fill('Description');

        //Click place order
        await page.locator('#cart_items').getByText('Place Order').click();

        //Enter payment details
        await page.getByTestId('name-on-card').fill(account.first_name, account.last_name);
        await page.getByTestId('card-number').fill(account.paymentDetails.card_number);
        await page.getByTestId('cvc').fill(account.paymentDetails.card_cvc);
        await page.getByTestId('expiry-month').fill(account.paymentDetails.card_expiry_month);
        await page.getByTestId('expiry-year').fill(account.paymentDetails.card_expiry_year);
        await page.getByTestId('pay-button').click();

        //Verify that order has been successfully placed
        expect(await page.getByTestId('order-placed')).toBeVisible();

        //Click continue
        await page.locator('.btn.btn-primary', {hasText: 'Continue'}).click();

        //Delete account
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(4).click();

        //Click continue
        await page.locator('.btn.btn-primary', {hasText: 'Continue'}).click();
    });

    test('Successfully create an account', async({page}) => {
        //Create account
        await createAcc(page);
    });

    test('Successfully login and progress through the order flow', async({page}) => {
        //Click login
        await page.getByText(" Signup / Login").click();

        expect(await page.locator('.login-form')).toBeVisible();

        //Enter account information
        await page.locator('.login-form').getByPlaceholder('Email Address').fill(account.email);
        await page.locator('.login-form').getByPlaceholder('Password').fill(account.password);
        await page.locator('.login-form').getByRole('button', {name: 'Login'}).click();

        //Confirm account name is correct
        expect(await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(9).locator('b').innerText()).toEqual(account.account_name);


        //Navigate to the products page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(1).click();

        //Verify the page is correct
        expect(page.url()).toContain('products');

        //Store items information
        const products = await page.locator('.features_items').locator('//div[@class="product-image-wrapper"]');
        const productName = await products.nth(0).locator('.productinfo > p').innerText();
        const productPrice = await products.nth(0).locator('.productinfo > h2').innerText();

        //Add product to cart;
        await products.nth(0).locator('.productinfo.text-center > .btn').click();

        //Click continue shopping
        await page.locator('.close-modal').click();

        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Cart information
        const cartProductName = await page.locator('.cart_description').locator('a').nth(0).innerText();
        const cartProductPrice = await page.locator('.cart_price').locator('p').nth(0).innerText();
        const cartProductQuantity = await page.locator('.cart_quantity').locator('button').nth(0).innerText();

        //Verify product is correct
        expect(cartProductName).toEqual(productName);
        expect(cartProductPrice.replace(/^Rs\. /, "")).toEqual(productPrice.replace(/^Rs\. /, ""));
        expect(cartProductQuantity).toEqual("1");

        //Click checkout
        await page.locator('.check_out').click();

        //Verify the page is correct
        expect(page.url()).toContain('checkout');

        //Verify account/delivery information
        const deliveryInfo = await page.locator('#address_delivery > li');
        const billingInfo = await page.locator('#address_invoice > li');
        expect(await deliveryInfo.nth(1).innerText()).toContain(account.first_name);
        expect(await deliveryInfo.nth(1).innerText()).toContain(account.last_name);
        expect(await deliveryInfo.nth(2).innerText()).toContain(account.company);
        expect(await deliveryInfo.nth(3).innerText()).toContain(account.address);
        expect(await deliveryInfo.nth(5).innerText()).toContain(account.city);
        expect(await deliveryInfo.nth(5).innerText()).toContain(account.state);
        expect(await deliveryInfo.nth(5).innerText()).toContain(account.zipcode);
        expect(await deliveryInfo.nth(6).innerText()).toContain(account.country);
        expect(await deliveryInfo.nth(7).innerText()).toContain(account.mobile_number);

        //Verify billing info
        expect(await deliveryInfo.nth(1).innerText()).toEqual(await billingInfo.nth(1).innerText());
        expect(await deliveryInfo.nth(2).innerText()).toEqual(await billingInfo.nth(2).innerText());
        expect(await deliveryInfo.nth(3).innerText()).toEqual(await billingInfo.nth(3).innerText());
        expect(await deliveryInfo.nth(5).innerText()).toEqual(await billingInfo.nth(5).innerText());
        expect(await deliveryInfo.nth(6).innerText()).toEqual(await billingInfo.nth(6).innerText());
        expect(await deliveryInfo.nth(7).innerText()).toEqual(await billingInfo.nth(7).innerText());

        //Cart information
        const cartProductNameSecondCheck = await page.locator('.cart_description').locator('a').nth(0).innerText();
        const cartProductPriceSecondCheck = await page.locator('.cart_price').locator('p').nth(0).innerText();
        const cartProductQuantitySecondCheck = await page.locator('.cart_quantity').locator('button').nth(0).innerText();

        //Verify product is correct
        expect(cartProductNameSecondCheck).toEqual(productName);
        expect(cartProductPriceSecondCheck.replace(/^Rs\. /, "")).toEqual(productPrice.replace(/^Rs\. /, ""));
        expect(cartProductQuantitySecondCheck).toEqual("1");

        //Order message
        await page.locator('#ordermsg > textarea').fill('Description');

        //Click place order
        await page.locator('#cart_items').getByText('Place Order').click();

        //Enter payment details
        await page.getByTestId('name-on-card').fill(account.first_name, account.last_name);
        await page.getByTestId('card-number').fill(account.paymentDetails.card_number);
        await page.getByTestId('cvc').fill(account.paymentDetails.card_cvc);
        await page.getByTestId('expiry-month').fill(account.paymentDetails.card_expiry_month);
        await page.getByTestId('expiry-year').fill(account.paymentDetails.card_expiry_year);
        await page.getByTestId('pay-button').click();

        //Verify that order has been successfully placed
        expect(await page.getByTestId('order-placed')).toBeVisible();

        //Click continue
        await page.locator('.btn.btn-primary', {hasText: 'Continue'}).click();

        //Delete account
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(4).click();

        //Click continue
        await page.locator('.btn.btn-primary', {hasText: 'Continue'}).click();
    });

    test('Successfully remove products from the cart', async({page}) => {
        //Navigate to the products page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(1).click();

        //Verify the page is correct
        expect(page.url()).toContain('products');

        //Store items information
        const products = await page.locator('.features_items').locator('//div[@class="product-image-wrapper"]');
        const firstProductName = await products.nth(0).locator('.productinfo > p').innerText();
        const firstProductPrice = await products.nth(0).locator('.productinfo > h2').innerText();
        const secondProductName = await products.nth(1).locator('.productinfo > p').innerText();
        const secondProductPrice = await products.nth(1).locator('.productinfo > h2').innerText();

        //Add first product to cart;
        await products.nth(0).locator('.productinfo.text-center > .btn').click();

        //Click continue shopping
        await page.locator('.close-modal').click();

        //Add first product to cart;
        await products.nth(1).locator('.productinfo.text-center > .btn').click();

        //Click continue shopping
        await page.locator('.close-modal').click();

        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Cart information
        const firstCartProductName = await page.locator('.cart_description').locator('a').nth(0).innerText();
        const firstCartProductPrice = await page.locator('.cart_price').locator('p').nth(0).innerText();
        const firstCartProductQuantity = await page.locator('.cart_quantity').locator('button').nth(0).innerText();
        const secondCartProductName = await page.locator('.cart_description').locator('a').nth(1).innerText();
        const secondCartProductPrice = await page.locator('.cart_price').locator('p').nth(1).innerText();
        const secondCartProductQuantity = await page.locator('.cart_quantity').locator('button').nth(1).innerText();

        //Verify product is correct
        const productsTotal = firstProductPrice.replace(/^Rs\. /, "") + secondProductPrice.replace(/^Rs\. /, "");
        const cartProductsTotal = firstCartProductPrice.replace(/^Rs\. /, "") + secondCartProductPrice.replace(/^Rs\. /, "");

        expect(firstCartProductName).toEqual(firstProductName);
        expect(firstCartProductPrice.replace(/^Rs\. /, "")).toEqual(firstProductPrice.replace(/^Rs\. /, ""));
        expect(firstCartProductQuantity).toEqual("1");
        expect(secondCartProductName).toEqual(secondProductName);
        expect(secondCartProductPrice.replace(/^Rs\. /, "")).toEqual(secondProductPrice.replace(/^Rs\. /, ""));
        expect(secondCartProductQuantity).toEqual("1");
        expect(productsTotal).toEqual(cartProductsTotal);

        //Remove the second product from the cart
        await page.locator('.cart_delete > .cart_quantity_delete').nth(1).click();

        //Add a wait because playwright is Speedy
        await page.waitForTimeout(1000);

        //Verify the product has been removed
        expect(await page.locator('.cart_delete > .cart_quantity_delete').count()).toEqual(1);
    });

    test('Successfully create an account for searched product', async({page}) => {
        //Create account
        await createAcc(page);
    });

    test('Successfully adds product to cart and verifies after login', async({page}) => {
        //Navigate to the products page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(1).click();

        //Verify the page is correct
        expect(page.url()).toContain('products');

        //Store products for later use
        const products = await page.locator('.features_items').locator('//div[@class="product-image-wrapper"]');
        const allProducts = await products.all();
        const rngProduct = Math.floor(Math.random() * allProducts.length);

        //Get product information
        const productName = await products.nth(rngProduct).locator('.productinfo.text-center').locator('p').innerText();

        //Search for the product
        await page.locator('#search_product').fill(productName);
        await page.locator('#submit_search').click();

        //Verify searched products information
        const searchedProductName = await page.locator('.productinfo.text-center').locator('p').innerText()
        expect(searchedProductName).toEqual(productName);

        //Add first product to cart;
        await products.nth(0).locator('.productinfo.text-center > .btn').click();

        //Click continue shopping
        await page.locator('.close-modal').click();

        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Cart information
        const cartProductName = await page.locator('.cart_description').locator('a').nth(0).innerText();

        //Verify product is correct
        expect(productName).toEqual(cartProductName);

        //Click login
        await page.getByText(" Signup / Login").click();

        expect(await page.locator('.login-form')).toBeVisible();

        //Enter account information
        await page.locator('.login-form').getByPlaceholder('Email Address').fill(account.email);
        await page.locator('.login-form').getByPlaceholder('Password').fill(account.password);
        await page.locator('.login-form').getByRole('button', {name: 'Login'}).click();

        //Confirm account name is correct
        expect(await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(9).locator('b').innerText()).toEqual(account.account_name);

        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Cart information
        const cartProductNameSecondCheck = await page.locator('.cart_description').locator('a').nth(0).innerText();

        //Verify product is correct
        expect(productName).toEqual(cartProductNameSecondCheck);

        //Delete account
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(4).click();

        //Click continue
        await page.locator('.btn.btn-primary', {hasText: 'Continue'}).click();
    });

    test('Successfully add to cart from recommended items', async ({page}) => {
        //Add product to cart;
        const activeItems = await page.locator('#recommended-item-carousel').locator('.active').locator('.productinfo');
        const allActiveItems = await activeItems.all();
        const rngActiveItem = Math.floor(Math.random() * allActiveItems.length);

        //Get product information
        const productName = await activeItems.nth(rngActiveItem).locator('p').innerText();

        //Add product to cart
        await activeItems.nth(rngActiveItem).locator('.btn').click();

        //Click continue shopping
        await page.locator('.close-modal').click();

        //Navigate to the cart page
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();

        //Cart information
        const cartProductName = await page.locator('.cart_description').locator('a').nth(0).innerText();

        //Verify product is correct
        expect(productName).toEqual(cartProductName);
    })
});