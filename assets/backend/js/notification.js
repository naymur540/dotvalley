$(document).ready(function () {
    //    delete function
    $(document).on('click', '#notification', function (e) {
        e.preventDefault();
        var link = $(this).attr("href");

        Swal.fire({
            title: 'Are you sure?',
            text: "Resend Notification",
            icon: '',
            showCancelButton: true,
            confirmButtonColor: '#27AE60',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = link
                Swal.fire(
                    'Sent!',
                    'Your notification has been sent.',
                    'success'
                )
            }
        })

    });
});
