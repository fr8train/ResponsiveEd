/**
 * Created by tyler on 12/6/2016.
 */
angular.module('proctor')
    .component('proctorNavBrand', {
        template: '<div class="navbar-brand">' +
                '<a ui-sref="root">'+
                    '<h4 class="proctor-header" style="font-size: 22px;">Proctor</h4>'+
                '</a>'+
            '</div>'
    });