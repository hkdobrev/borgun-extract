#!/usr/bin/env node
(function() {

'use strict';

var fs = require('fs');

function getDirName() {
    var dir = process.argv[2];

    if (!dir) {
        throw new Error('Specify a directory');
    }

    if (!fs.lstatSync(dir).isDirectory()) {
        dir = process.argv[3];

        if (!dir) {
            throw new Error('Specify a directory');
        }

        if (!fs.lstatSync(dir).isDirectory()) {
            throw new Error(dir + 'is not a directory');
        }
    }

    return dir;
}

function processDir(dir) {
    var path = require('path');
    // Read the directory
    fs.readdir(dir, function (err, list) {
        // For every file in the list
        list.forEach(function (file) {
            var ext = path.extname(file);
            if ('.html' === ext) {
                processHtmlFile(dir + file)
            }
        });
    });
}

function processHtmlFile(file) {
    fs.readFile(file, 'utf8', function (err, html) {
        if (err) {
            console.error('Error reading HTML file: ', err);
        }

        processHtml(html);
    });
}

function processHtml(html) {
    var cheerio = require('cheerio');
    var $ = cheerio.load(html);
    var dateCell = $('table td').filter(function() {
        return 'Date' === $(this).text();
    });
    var headRow = dateCell.parent();
    var statements = headRow.nextAll();
    statements.each(function() {
        var stop = false;
        $(this).find('td').each(function() {
            var contents = $(this).text().trim();
            if ('Total' === contents || '_' === contents[0]) {
                stop = true;
                return false;
            }
            if (contents.length > 0) {
                console.log(contents);
            }
        });

        if (stop) {
            return false;
        }
    });
}

processDir(getDirName());

}());

