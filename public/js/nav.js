var navBarImport = document.getElementById('_nav').import;
var navBar = navBarImport.getElementById('navigation');
document.getElementsByClassName('body')[0].appendChild(navBar);

console.log(document.getElementsByClassName('body'));

var currentUrlPath = window.location.pathname.substring(0);

var tabs = navBar.querySelectorAll('li');

var selectTab = {
    '\/': function() {
        tabs[0].style.borderBottom = '0px';
        tabs[0].style.backgroundColor = '#ffffff';
    },
    '\/bio': function() {
        tabs[1].style.borderBottom = '0px';
        tabs[1].style.backgroundColor = '#ffffff';
    },
    '\/code': function() {
            tabs[2].style.borderBottom = '0px';
            tabs[2].style.backgroundColor = '#ffffff';
        }
        // ,
        // '\/chat': function() {
        //     tabs[3].style.borderBottom = '0px';
        // }
};

console.log(currentUrlPath);
console.log(typeof selectTab[currentUrlPath]);

(function() {
    selectTab[currentUrlPath]();
}());