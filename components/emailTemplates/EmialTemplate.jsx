import * as React from 'react';

export const EmailTemplate = ({
    body
}) => (
    <div className="emailContainerStyle" style={emailContainerStyle}>
        <div className="body" style={bodyStyle}>
            {body}
        </div>
        <div className="footer" style={footerStyle}>
            <a href="redapuntes.com">
                <div className="icon" style={iconStyle}></div>
            </a>
            <p className="copyright" style={copyrightStyle}>
                Copyright © 2024 redapuntes.com, Todos los derechos reservados
            </p>
            <p className="copyright" style={copyrightStyle}>
                Por favor no responder a este mail, si tienes dudas puedes consultar a <strong><a href="https://www.instagram.com/red.apuntes" target='_blank'>RED APUNTES</a></strong>
            </p>
        </div>
    </div>
);

const emailContainerStyle = {
    background: '#fff',
    color: '#000',
    borderRadius: '5px',
    maxWidth: '500px',
    margin: '0 auto',
    border: '1px solid #000',
};

const headerStyle = {
    backgroundColor: '#000',
    padding: '1px 10px',
};

const headerTextStyle = {
    fontSize: '22px',
    color: '#fff',
    textAlign: 'center',
};

const labelStyle = {
    fontWeight: 'bold',
    marginRight: '10px',
};

const bodyStyle = {
    padding: '5px 20px',
};

const footerStyle = {
    padding: '0 20px',
    borderTop: '1px solid #efefef',
};

const iconStyle = {
    backgroundImage: 'url("https://redapuntes.com/icons/icon-2.png")',
    height: '60px',
    width: '60px',
    backgroundSize: '100% 100%',
    margin: '0 auto',
};

const copyrightStyle = {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
};

const redesStyle = {
    display: 'flex',
    justifyContent: 'center',
};

const redesLinkStyle = {
    color: '#000',
    fontSize: '24px',
    margin: '0 30px',
    textDecoration: 'none',
};
