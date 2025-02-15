from django import forms

class EmailConfirmationForm(forms.Form):
    email = forms.EmailField(label="E-mail", required=True)
