const { test, expect} = require('@playwright/test');
const account = require('../test-data/accountDetails.json');

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

test.describe('Register checks', () => {
    test('Successfully registers a new user and deletes their account', async ({page}) => {
        
        //Create account function
        await createAcc(page);
    
        //Delete account
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(4).click();
    
        //Click continue
        await page.locator('.btn.btn-primary', {hasText: 'Continue'}).click();
    
    });

    test('Successfully registers a new user', async ({page}) => {
        //Create account function
        await createAcc(page);        
    });

    test('Unsucessfully registers a new user with an existing email', async ({page}) => {
        //Click login
        await page.getByText(" Signup / Login").click();
    
        //Confirm login page is visible
        expect(await page.getByRole('heading', { name: 'New User Signup!' })).toBeVisible();
        
        //Enter name and email
        await page.getByPlaceholder('Name').fill(account.account_name);
        await page.locator('form').filter({ hasText: 'Signup' })
        .getByPlaceholder('Email Address').fill(account.email);

        //Click signup
        await page.getByRole('button', { name: 'Signup' }).click();

        expect(await page.locator('.signup-form').locator('p').innerText()).toEqual('Email Address already exist!')
    });

    test('Login with correct details and then delete the account ', async ({page}) => {
        //Click login
        await page.getByText(" Signup / Login").click();

        expect(await page.locator('.login-form')).toBeVisible();

        //Enter account information
        await page.locator('.login-form').getByPlaceholder('Email Address').fill(account.email);
        await page.locator('.login-form').getByPlaceholder('Password').fill(account.password);
        await page.locator('.login-form').getByRole('button', {name: 'Login'}).click();

        //Confirm account name is correct
        expect(await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(9).locator('b').innerText()).toEqual(account.account_name);

        //Delete account
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(4).click();

        //Click continue
        await page.locator('.btn.btn-primary', {hasText: 'Continue'}).click();
    });
});

test.describe('Login checks', () => {
    test('Successfully registers a new user', async ({page}) => {
        //Create account function
        await createAcc(page);        
    });

    test('Login with incorrect details', async ({page}) => {
        //Click login
        await page.getByText(" Signup / Login").click();

        expect(await page.locator('.login-form')).toBeVisible();

        //Enter account information
        await page.locator('.login-form').getByPlaceholder('Email Address').fill(account.email);
        await page.locator('.login-form').getByPlaceholder('Password').fill(account.password+1);
        await page.locator('.login-form').getByRole('button', {name: 'Login'}).click();

        expect(await page.locator('.login-form').locator('p').innerText()).toEqual('Your email or password is incorrect!');

    });
    test('Login with correct details and then log out', async ({page}) => {
        //Click login
        await page.getByText(" Signup / Login").click();

        expect(await page.locator('.login-form')).toBeVisible();

        //Enter account information
        await page.locator('.login-form').getByPlaceholder('Email Address').fill(account.email);
        await page.locator('.login-form').getByPlaceholder('Password').fill(account.password);
        await page.locator('.login-form').getByRole('button', {name: 'Login'}).click();

        //Confirm account name is correct
        expect(await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(9).locator('b').innerText()).toEqual(account.account_name);

        //Log out of the account
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(3).click();

    });
    test('Login with correct details and then delete the account ', async ({page}) => {
        //Click login
        await page.getByText(" Signup / Login").click();

        expect(await page.locator('.login-form')).toBeVisible();

        //Enter account information
        await page.locator('.login-form').getByPlaceholder('Email Address').fill(account.email);
        await page.locator('.login-form').getByPlaceholder('Password').fill(account.password);
        await page.locator('.login-form').getByRole('button', {name: 'Login'}).click();

        //Confirm account name is correct
        expect(await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(9).locator('b').innerText()).toEqual(account.account_name);

        //Delete account
        await page.locator('.shop-menu.pull-right').getByRole('listitem').nth(4).click();

        //Click continue
        await page.locator('.btn.btn-primary', {hasText: 'Continue'}).click();

    });

});