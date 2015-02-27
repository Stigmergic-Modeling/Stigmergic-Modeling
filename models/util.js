
module.exports = {

    toHumanDate: function(date) {
        var year = date.getFullYear();
        var monthRaw = date.getMonth();
        var month;
        var day = date.getDate();
        var daySuffix;

        switch (monthRaw) {
            case 0:
                month = 'Jan';
                break;
            case 1:
                month = 'Feb';
                break;
            case 2:
                month = 'Mar';
                break;
            case 3:
                month = 'Apr';
                break;
            case 4:
                month = 'May';
                break;
            case 5:
                month = 'Jun';
                break;
            case 6:
                month = 'Jul';
                break;
            case 7:
                month = 'Aug';
                break;
            case 8:
                month = 'Sep';
                break;
            case 9:
                month = 'Oct';
                break;
            case 10:
                month = 'Nov';
                break;
            case 11:
                month = 'Dec';
                break;
        }

        if (1 === day || 21 === day || 31 === day) {
            daySuffix = 'st';
        } else if (2 === day || 22 === day) {
            daySuffix = 'nd';
        } else if (3 === day || 23 === day) {
            daySuffix = 'rd';
        } else {
            daySuffix = 'th';
        }

        return ' ' + month + ' ' + day + daySuffix + ', ' + year;
    }


};
