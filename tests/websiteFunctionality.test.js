const {test, expect} = require('@playwright/test');
const account = require('./../test-data/accountDetails.json');
const contact = require('./../test-data/contactUsDetails.json');
const path = require('path');

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
        const firstProductName = products.nth(0).locator('.productinfo.text-center').locator('p').innerText();
        const firstProductPrice = products.nth(0).locator('.productinfo.text-center').locator('h2').innerText();
        const secondProductName = products.nth(1).locator('.productinfo.text-center').locator('p').innerText();
        const secondProductPrice = products.nth(1).locator('.productinfo.text-center').locator('h2').innerText();

        //Add products to cart;
        await products.nth(0).locator('.productinfo').getByText('Add to cart');


        // //Navigate to the cart page
        // await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(2).click();
    });
});