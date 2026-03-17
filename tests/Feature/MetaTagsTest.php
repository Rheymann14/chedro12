<?php

test('public pages render default og metadata with the ched logo', function () {
    $response = $this->get('/contactUs');

    $response->assertOk();
    $response->assertSee('Contact Us | CHED Portal', false);
    $response->assertSee('og:image', false);
    $response->assertSee('/ched%20logo.png', false);
});
